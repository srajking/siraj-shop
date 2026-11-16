import { Cart } from './js/cart.js';
const countEl = document.querySelector('#count');
const totalEl = document.querySelector('#total');
function deepFreeze(o) {
  for (const v of Object.values(o)) if (typeof v === 'object' && v !== null) deepFreeze(v);
  return Object.freeze(o);
}
const catalog = deepFreeze([...document.querySelectorAll('.card')].map(card => ({
  name: card.querySelector('h2').textContent,
  price: { amount: Number(card.querySelector('.price bdi').textContent.replace(/[^0-9]/g, '')), currency: 'IQD' },
})));
function memberView(list) {
  const copy = structuredClone(list);
  for (const p of copy) p.price.amount = Math.round(p.price.amount * 0.9);
  return copy;
}
memberView(catalog).forEach((p, i) => {
  const tag = document.createElement('small');
  tag.className = 'member';
  tag.textContent = ' · للاعضاء ' + p.price.amount.toLocaleString('en-US');
  document.querySelectorAll('.card .price')[i].append(tag);
});
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem('cart'), (key, value) => (value?.qty !== undefined ? value.qty : value));   // old format { price, qty } -> qty
    return Cart.from(saved, name => catalog.find(p => p.name === name)?.price.amount ?? 0);
  } catch (err) {
    console.warn(new Error('saved cart is broken, starting empty', { cause: err }));
    localStorage.removeItem('cart');
    return new Cart();
  }
}
const MUTATORS = new Set(['add']);             // methods that change the cart
function reactive(target, onChange) {
  return new Proxy(target, {
    get(t, key) {
      const value = Reflect.get(t, key, t);     // getters run on the real cart: #items lives there
      if (typeof value !== 'function') return value;
      return (...args) => {
        const out = value.apply(t, args);       // this = the real cart, not the proxy
        if (MUTATORS.has(key)) onChange();
        return out;
      };
    },
  });
}
const cart = reactive(loadCart(), () => render());
function render() {
  const { count, total } = cart.summary();
  countEl.textContent = count;
  totalEl.textContent = total.toLocaleString('en-US');
  countEl.title = [...cart].map(([name, i]) => name + ' × ' + i.qty).join('، ');
}
render();
async function loadProducts() {
  const res = await fetch('/api/products');                // same server, so a path is enough
  if (!res.ok) throw new Error('products: HTTP ' + res.status);
  return res.json();
}
const productsReady = loadProducts();                     // one request, shared by everyone below
fetch('/api/cart').catch(() => {});                      // get our cart cookie now, not in a reply that may time out
function checkStock(name) {
  return productsReady.then(list => {
    const p = list.find(x => x.name === name);
    if (!p) throw new Error('no stock record: ' + name);
    return p.stock;
  });
}
productsReady.then(list => {                              // show the server prices
  for (const card of document.querySelectorAll('.card')) {
    const p = list.find(x => x.name === card.querySelector('h2').textContent);
    if (!p) continue;
    card.querySelector('.price bdi').textContent = p.price.toLocaleString('en-US') + ' IQD';
    card.querySelector('.member').textContent = ' · للاعضاء ' + Math.round(p.price * 0.9).toLocaleString('en-US');
  }
  cart.reprice(name => list.find(x => x.name === name)?.price);
  render();
}).catch(err => console.warn(new Error('could not load products', { cause: err })));
function badge(i, text) {
  const tag = document.createElement('small');
  tag.className = 'stock';
  tag.textContent = text;
  document.querySelectorAll('.card .price')[i].append(tag);
}
Promise.allSettled(catalog.map(p => checkStock(p.name)))
  .then(results => results.forEach((r, i) => badge(i, r.status === 'fulfilled' ? 'متوفر: ' + r.value : 'المخزون غير معروف')));
const stockStream = new EventSource('/api/stock/stream');   // the server tells us when stock changes
stockStream.addEventListener('stock', async e => {
  const list = await productsReady;
  for (const { id, stock } of JSON.parse(e.data).stock) {
    const p = list.find(x => x.id === id);
    if (!p) continue;
    p.stock = stock;                                          // checkStock() reads this list
    const i = catalog.findIndex(c => c.name === p.name);
    const tag = document.querySelectorAll('.card .price')[i]?.querySelector('.stock');
    if (tag) tag.textContent = 'متوفر: ' + stock;
  }
});
const search = document.querySelector('.search');
let searching;                                            // the search whose answer we still want
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
search.addEventListener('input', debounce(async () => {   // wait for a 300 ms pause in typing, then ask the API
  searching?.abort();                                      // a newer letter makes the old search useless
  const ctrl = searching = new AbortController();
  const params = new URLSearchParams({ q: search.value.trim() });
  try {
    const res = await fetch('/api/products?' + params, { signal: ctrl.signal });
    if (!res.ok) return;
    const names = new Set((await res.json()).map(p => p.name));
    for (const card of document.querySelectorAll('.card')) card.hidden = !names.has(card.querySelector('h2').textContent);
  } catch (err) {
    if (err.name !== 'AbortError') console.warn(err);
  }
}, 300));
async function gql(query, variables) {                    // one address; errors arrive inside a 200
  const res = await fetch('/api/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
  const body = await res.json();
  if (body.errors) throw new Error('graphql: ' + body.errors.map(e => e.message).join(', '));
  return body.data;
}
const REVIEWS = `query Reviews($after: String) {
  reviewSummary { count avg }
  reviews(limit: 5, after: $after) { items { stars text product { name } } next }
}`;
const reviewList = document.querySelector('#review-list'), moreReviews = document.querySelector('#more-reviews');
let reviewsAfter = '';                                    // the server's cursor: '' = first page, null = the end
async function loadReviews() {
  moreReviews.disabled = true;                            // one page at a time
  try {
    const { reviews, reviewSummary: s } = await gql(REVIEWS, { after: reviewsAfter || null });
    for (const r of reviews.items) {
      const li = document.createElement('li');
      li.textContent = '★'.repeat(r.stars) + ' ' + r.text + ' — ' + r.product.name;   // written by customers: never innerHTML
      reviewList.append(li);
    }
    document.querySelector('#avg').textContent = `${s.avg} من 5 · ${s.count} تقييم`;
    reviewsAfter = reviews.next;
  } catch (err) {
    console.warn(err);
  }
  moreReviews.disabled = false;
  moreReviews.hidden = reviewsAfter === null;
}
moreReviews.addEventListener('click', loadReviews);
loadReviews();
document.querySelector('#receipt').addEventListener('click', async () => {   // the server's receipt as a file
  const res = await fetch('/api/cart/receipt');
  if (!res.ok) { showToast('لا توجد فاتورة: ' + ((await res.json().catch(() => null))?.error ?? res.status)); return; }
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'receipt.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});
const toast = document.createElement('p');
toast.className = 'toast';
toast.setAttribute('role', 'status');
document.body.append(toast);
let hideTimer;
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
async function canAdd(name) {
  const left = await checkStock(name).catch(() => Infinity);   // no record: do not block
  return cart.qty(name) < left;
}
const buttons = [...document.querySelectorAll('.add')];
function showQty(btn, name) {
  const num = document.createElement('b');
  num.textContent = cart.qty(name);
  btn.replaceChildren('في السلة: ', num);
}
document.querySelector('.grid').addEventListener('click', async e => {   // one listener for every card
  const btn = e.target.closest('.add');
  if (!btn) return;
  const { name, price } = catalog[buttons.indexOf(btn)];
  if (!(await canAdd(name))) { showToast('لا يوجد مخزون كاف: ' + name); return; }
  const live = (await productsReady.catch(() => [])).find(p => p.name === name);
  if (live) {                                              // tell the server first
    showToast('جار الاضافة…');
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: live.id, qty: 1 }),
        signal: AbortSignal.timeout(3000),                   // never wait forever
      });
      if (!res.ok) { showToast('لم يضف: ' + ((await res.json().catch(() => null))?.error ?? res.status)); return; }
    } catch (err) {
      if (err.name !== 'TimeoutError') { showToast('لا يوجد اتصال بالخادم'); return; }
      const now = await fetch('/api/cart').then(r => r.json()).catch(() => null);   // timed out: did it arrive anyway?
      if (!(now?.items.find(i => i.id === live.id)?.qty > cart.qty(name))) { showToast('الشبكة بطيئة — حاول مرة ثانية'); return; }
    }
  }
  cart.add(name, live?.price ?? price.amount);
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('اضيف: ' + name);
  showQty(btn, name);
});

const cartEl = document.querySelector('.cart');
cartEl.setAttribute('role', 'button');
cartEl.tabIndex = 0;
function openMiniCart() {
  const box = document.createElement('div');
  box.className = 'mini-cart';
  box.setAttribute('role', 'dialog');
  box.textContent = [...cart].map(([name, i]) => name + ' × ' + i.qty).join('، ') || 'السلة فارغة';
  document.body.append(box);
  const ctrl = new AbortController();             // one switch for everything this box listens to
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { box.remove(); ctrl.abort(); }
  }, { signal: ctrl.signal });
}
cartEl.addEventListener('click', openMiniCart);

const menuBtn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    menuBtn.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); menuBtn.focus();
  }
});
