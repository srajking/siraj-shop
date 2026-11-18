import { Cart } from './js/cart.js';
import { api, ApiError } from './js/api.js';
const countEl = document.querySelector('#count');
const totalEl = document.querySelector('#total');
function deepFreeze(o) {
  for (const v of Object.values(o)) if (typeof v === 'object' && v !== null) deepFreeze(v);
  return Object.freeze(o);
}
const catalog = deepFreeze([...document.querySelectorAll('.card')].map(card => ({
  name: card.querySelector('h3').textContent,
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
const productsReady = api.products.list();               // one request, shared by everyone below
api.cart.get().catch(() => {});                          // get our cart cookie now, not in a reply that may time out
function checkStock(name) {
  return productsReady.then(list => {
    const p = list.find(x => x.name === name);
    if (!p) throw new Error('no stock record: ' + name);
    return p.stock;
  });
}
productsReady.then(list => {                              // show the server prices
  for (const card of document.querySelectorAll('.card')) {
    const p = list.find(x => x.name === card.querySelector('h3').textContent);
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
const stockStream = api.stockStream();                     // the server tells us when stock changes
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
  try {
    const names = new Set((await api.products.list({ q: search.value.trim() }, { signal: ctrl.signal })).map(p => p.name));
    const cards = [...document.querySelectorAll('.card')];
    for (const card of cards) card.hidden = !names.has(card.querySelector('h3').textContent);
    const n = cards.filter(c => !c.hidden).length, q = search.value.trim();   // one sentence when typing stops
    document.querySelector('#search-status').textContent = !q ? '' : n ? `${n} من ${cards.length} منتجات` : `لا منتجات تطابق «${q}»`;
  } catch (err) {
    if (err.name !== 'AbortError') console.warn(err);
  }
}, 300));
const REVIEWS = `query Reviews($after: String) {
  reviewSummary { count avg }
  reviews(limit: 5, after: $after) { items { stars text product { name } } next }
}`;
const reviewList = document.querySelector('#review-list'), moreReviews = document.querySelector('#more-reviews');
let reviewsAfter = '';                                    // the server's cursor: '' = first page, null = the end
const reviewsStatus = document.querySelector('#reviews-status');
async function loadReviews(asked) {
  if (moreReviews.getAttribute('aria-disabled') === 'true') return;   // one page at a time
  moreReviews.setAttribute('aria-disabled', 'true');      // not disabled: the focus stays on the button
  let first = null, total = 0;
  try {
    const { reviews, reviewSummary: s } = await api.graphql(REVIEWS, { after: reviewsAfter || null });
    for (const r of reviews.items) {
      const li = document.createElement('li');
      const stars = document.createElement('span'), said = document.createElement('span');
      stars.textContent = '★'.repeat(r.stars); stars.setAttribute('aria-hidden', 'true');   // for the eye
      said.textContent = r.stars + ' من 5'; said.className = 'vh';                          // for the ear
      const words = document.createElement('bdi');         // any language, any direction: kept apart from ours
      words.textContent = r.text;                           // written by customers: never innerHTML
      if (/[A-Za-z]/.test(r.text) && !/[\u0600-\u06FF]/.test(r.text)) words.lang = 'en';   // Latin letters, no Arabic: read it in English
      li.append(stars, said, ' ', words, ' — ' + r.product.name);
      reviewList.append(li);
      first ??= li;
    }
    total = s.count;
    document.querySelector('#avg').textContent = `${s.avg} من 5 · ${s.count} تقييم`;
    reviewsAfter = reviews.next;
  } catch (err) {
    console.warn(err);
  }
  moreReviews.removeAttribute('aria-disabled');
  moreReviews.hidden = reviewsAfter === null;
  if (!asked || !first) return;                           // the first page loads by itself: say nothing
  reviewsStatus.textContent = `اضيفت تقييمات · ${reviewList.children.length} من ${total}`;
  if (moreReviews.hidden) { first.tabIndex = -1; first.focus(); }   // the button is gone: go to what is new
}
moreReviews.addEventListener('click', () => loadReviews(true));
loadReviews();
document.querySelector('#receipt').addEventListener('click', async () => {   // the server's receipt as a file
  const file = await api.cart.receipt().catch(err => { showToast('لا توجد فاتورة: ' + err.message); });
  if (!file) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file.blob);
  a.download = file.name ?? 'receipt.csv';
  a.click();
  URL.revokeObjectURL(a.href);
});
const toast = document.createElement('p');
toast.className = 'toast';
toast.setAttribute('role', 'status');
document.body.append(toast);
let hideTimer;
function hideLater() {                                   // more words, more time
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('show'), 5000 + 300 * toast.textContent.split(' ').length);
}
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  hideLater();
}
toast.addEventListener('mouseenter', () => clearTimeout(hideTimer));   // someone is reading it: wait
toast.addEventListener('mouseleave', hideLater);
async function canAdd(name) {
  const left = await checkStock(name).catch(() => Infinity);   // no record: do not block
  return cart.qty(name) < left;
}
const buttons = [...document.querySelectorAll('.add')];
function showQty(btn, name) {
  const num = document.createElement('b'), who = document.createElement('span');
  num.textContent = cart.qty(name);
  who.className = 'vh'; who.textContent = name + ' — ';     // heard, not seen: which product this is
  btn.replaceChildren(who, 'في السلة: ', num);
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
      await api.cart.add(live.id, 1);                        // 3 s timeout inside the layer
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      if (err.code === 'NETWORK') { showToast('لا يوجد اتصال بالخادم'); return; }
      if (err.code !== 'TIMEOUT') { showToast('لم يضف: ' + err.message); return; }
      const now = await api.cart.get().catch(() => null);  // timed out: did it arrive anyway?
      if (!(now?.items.find(i => i.id === live.id)?.qty > cart.qty(name))) { showToast('الشبكة بطيئة — حاول مرة ثانية'); return; }
    }
  }
  cart.add(name, live?.price ?? price.amount);
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('اضيف: ' + name);
  showQty(btn, name);
});

const cartEl = document.querySelector('.cart');
const mini = document.querySelector('.mini-cart');
function openMiniCart() {
  if (mini.open) return;                                   // one box, never two
  mini.querySelector('.mini-items').textContent = [...cart].map(([name, i]) => name + ' × ' + i.qty).join('، ') || 'السلة فارغة';
  mini.showModal();                                        // focus moves in, the page behind goes inert, Esc closes
}
mini.querySelector('.mini-close').addEventListener('click', () => mini.close());   // focus goes back to the cart button
cartEl.addEventListener('click', openMiniCart);

const menuBtn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('open', !open);
});
for (const a of menu.querySelectorAll('a')) a.addEventListener('click', () => {
  if (!menu.classList.contains('open')) return;
  menuBtn.setAttribute('aria-expanded', 'false'); menu.classList.remove('open');   // the button tells the truth again
});
function markCurrent() {                                   // the link of the section the user is in
  const here = location.hash || '#';
  for (const a of menu.querySelectorAll('a[href^="#"]')) {
    if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
}
markCurrent();
addEventListener('hashchange', markCurrent);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    menuBtn.setAttribute('aria-expanded', 'false'); menu.classList.remove('open'); menuBtn.focus();
  }
});

const news = document.querySelector('.newsletter'), newsEmail = document.querySelector('#news-email'), newsErr = document.querySelector('#news-err');
news.addEventListener('submit', e => {
  e.preventDefault();                                       // stay on the page: no reload, nothing typed is lost
  const ok = newsEmail.value.trim() !== '' && newsEmail.checkValidity();
  newsEmail.setAttribute('aria-invalid', String(!ok));      // the reader hears "invalid" on the field itself
  newsErr.textContent = ok ? '' : 'Enter an email like name@example.com';
  if (!ok) { newsEmail.focus(); return; }
  newsEmail.value = '';
  document.querySelector('#news-done').textContent = 'Thanks! Check your inbox.';   // a status region: spoken without moving focus
});
