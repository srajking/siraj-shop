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
    get count() { return sumOf([...this.#items.values()].map(i => i.qty)); }
    get total() { return discount(sumOf([...this.#items.values()].map(i => i.price * i.qty))); }
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
    const cart = Cart.from(JSON.parse(localStorage.getItem('cart')));
  function render() {
    countEl.textContent = cart.count;
    totalEl.textContent = cart.total.toLocaleString('en-US');
  }
  render();
  document.querySelectorAll('.add').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      cart.add(catalog[i].name, catalog[i].price.amount);
      localStorage.setItem('cart', JSON.stringify(cart));
      render();
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
