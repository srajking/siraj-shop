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
  reprice(priceOf) { for (const [name, i] of this.#items) i.price = priceOf(name) ?? i.price; }
  qty(name) { return this.#items.get(name)?.qty ?? 0; }
  *[Symbol.iterator]() { yield* this.#items; }
  summary() {
    const items = [...this.#items.values()];
    const count = sumOf(items.map(i => i.qty));
    const total = discount(sumOf(items.map(i => i.price * i.qty)));
    return { count, total };
  }
  toJSON() { return { v: 2, items: [...this.#items].map(([name, i]) => [name, i.qty]) }; }   // no prices: they come from the catalog
  static from(data, priceOf = () => 0) {
    const c = new Cart();
    const ok = Array.isArray(data?.items) && data.items.every(Array.isArray);
    if (ok) for (const [name, qty] of data.items) c.#items.set(name, { price: priceOf(name), qty });
    return c;
  }
}
