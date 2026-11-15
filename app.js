(function () {
  'use strict';
  const countEl = document.querySelector('#count');
  const totalEl = document.querySelector('#total');
  const sumOf = items => items.reduce((a, b) => a + b, 0);
  const discount = sum => (sum >= Cart.LIMIT ? sum * Cart.RATE : sum);
  class Cart {
    static LIMIT = 10000;
    static RATE = 0.9;
    #items = [];
    add(price) { this.#items = [...this.#items, price]; }
    get count() { return this.#items.length; }
    get total() { return discount(sumOf(this.#items)); }
    toJSON() { return { items: this.#items }; }
    static from(data) {
      const c = new Cart();
      if (data?.items) c.#items = [...data.items];
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
      cart.add(catalog[i].price.amount);
      localStorage.setItem('cart', JSON.stringify(cart));
      render();
      btn.textContent = 'تمت الاضافة';
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
