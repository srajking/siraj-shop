(function () {
  'use strict';
  const countEl = document.querySelector('#count');
  const totalEl = document.querySelector('#total');
  const sumOf = items => items.reduce((a, b) => a + b, 0);
  const discount = sum => (sum >= Cart.LIMIT ? sum * Cart.RATE : sum);
  class Cart {
    static LIMIT = 10000;
    static RATE = 0.9;
    #items = new Map();
    add(name, price) {
      const qty = (this.#items.get(name)?.qty ?? 0) + 1;
      this.#items.set(name, { price, qty });
    }
    qty(name) { return this.#items.get(name)?.qty ?? 0; }
    *[Symbol.iterator]() { yield* this.#items; }
    summary() {
      const items = [...this.#items.values()];
      const count = sumOf(items.map(i => i.qty));
      const total = discount(sumOf(items.map(i => i.price * i.qty)));
      return { count, total };
    }
    toJSON() { return { items: [...this.#items] }; }
    static from(data) {
      const c = new Cart();
      const ok = Array.isArray(data?.items) && data.items.every(Array.isArray);
      if (ok) c.#items = new Map(data.items);
      return c;
    }
  }
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
      return Cart.from(JSON.parse(localStorage.getItem('cart')));
    } catch (err) {
      console.warn(new Error('saved cart is broken, starting empty', { cause: err }));
      localStorage.removeItem('cart');
      return new Cart();
    }
  }
  const cart = loadCart();
  function render() {
    const { count, total } = cart.summary();
    countEl.textContent = count;
    totalEl.textContent = total.toLocaleString('en-US');
    countEl.title = [...cart].map(([name, i]) => name + ' × ' + i.qty).join('، ');
  }
  render();
  const stockServer = { 'دفتر A5': 12, 'حقيبة ظهر': 3 };   // pretend server: no record for the pen
  function checkStock(name) {
    return new Promise((resolve, reject) => {
      setTimeout(() => (name in stockServer ? resolve(stockServer[name]) : reject(new Error('no stock record: ' + name))), 300);
    });
  }
  function badge(i, text) {
    const tag = document.createElement('small');
    tag.className = 'stock';
    tag.textContent = text;
    document.querySelectorAll('.card .price')[i].append(tag);
  }
  Promise.allSettled(catalog.map(p => checkStock(p.name)))
    .then(results => results.forEach((r, i) => badge(i, r.status === 'fulfilled' ? 'متوفر: ' + r.value : 'المخزون غير معروف')));
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
  document.querySelectorAll('.add').forEach((btn, i) => {
    btn.addEventListener('click', async () => {
      if (!(await canAdd(catalog[i].name))) { showToast('لا يوجد مخزون كاف: ' + catalog[i].name); return; }
      cart.add(catalog[i].name, catalog[i].price.amount);
      localStorage.setItem('cart', JSON.stringify(cart));
      render();
      showToast('اضيف: ' + catalog[i].name);
      btn.textContent = 'في السلة: ' + cart.qty(catalog[i].name);
    });
  });

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
})();
