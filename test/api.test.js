// the API layer, tested without the real server: MSW answers instead
import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import { api } from '../js/api.js';
const API = 'http://localhost:4000/api';
const products = [{ id: 1, name: 'دفتر A5', price: 3000, stock: 12, category: 'stationery' }];
const server = setupServer(
  http.get(`${API}/products`, () => HttpResponse.json(products)),
  http.post(`${API}/cart/items`, async ({ request }) => {
    const { qty } = await request.json();
    return qty > 3 ? HttpResponse.json({ error: 'not enough stock' }, { status: 409 }) : HttpResponse.json({ id: 3, qty }, { status: 201 });
  }),
);
before(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
after(() => server.close());
test('products: a good list passes the shape check', async () => {
  assert.equal((await api.products.list())[0].name, 'دفتر A5');
});
test('products: price as an object is a ShapeError', async () => {
  server.use(http.get(`${API}/products`, () => HttpResponse.json([{ ...products[0], price: { amount: 3000 } }])));
  await assert.rejects(api.products.list(), { name: 'ShapeError' });
});
test('cart: too many is CONFLICT with the server message', async () => {
  await assert.rejects(api.cart.add(3, 5), { code: 'CONFLICT', message: 'not enough stock' });
});
test('cart: a slow answer is TIMEOUT after 3 s', async () => {
  server.use(http.post(`${API}/cart/items`, async () => { await delay(3500); return HttpResponse.json({}); }));
  await assert.rejects(api.cart.add(3, 1), { code: 'TIMEOUT' });
});
test('graphql: an error inside 200 keeps its code', async () => {
  server.use(http.post(`${API}/graphql`, () => HttpResponse.json({ data: null, errors: [{ message: 'bad cursor', extensions: { code: 'BAD_CURSOR' } }] })));
  await assert.rejects(api.graphql('{ reviews { next } }'), { code: 'BAD_CURSOR' });
});
test('receipt: a file with its name', async () => {
  server.use(http.get(`${API}/cart/receipt`, () => new HttpResponse('product,qty\r\n', { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="siraj-receipt.csv"' } })));
  const file = await api.cart.receipt();
  assert.equal(file.name, 'siraj-receipt.csv');
  assert.equal(file.blob.type, 'text/csv');
});
