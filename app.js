(function () {
  const countEl = document.querySelector('#count');
  const totalEl = document.querySelector('#total');
  const cartMethods = {
    add(e) {
      const btn = e.currentTarget;
      const price = btn.closest('.card').querySelector('.price').textContent;
      this.count += 1;
      this.sum += Number(price.replace(/[^0-9]/g, ''));
      this.save();
      this.render();
      btn.textContent = 'تمت الاضافة';
    },
    total() {
      return this.sum >= 10000 ? this.sum * 0.9 : this.sum;
    },
    save() {
      localStorage.setItem('cart', JSON.stringify({ count: this.count, sum: this.sum }));
    },
    render() {
      countEl.textContent = this.count;
      totalEl.textContent = this.total().toLocaleString('en-US');
    },
  };
  const saved = JSON.parse(localStorage.getItem('cart'));
  const cart = Object.assign(Object.create(cartMethods), { count: 0, sum: 0 }, saved);
  cart.render();
  document.querySelectorAll('.add').forEach(btn => {
    btn.addEventListener('click', cart.add.bind(cart));
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
