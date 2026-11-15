// the cart: prices, quantities, discount — no DOM here
export const sumOf = items => items.reduce((a, b) => a + b, 0);
export const discount = sum => (sum >= Cart.LIMIT ? sum * Cart.RATE : sum);
export class Cart {
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
