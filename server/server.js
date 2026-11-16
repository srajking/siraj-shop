// Siraj Shop API v2 — a small local server for the book. Run: npm run api
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const products = JSON.parse(await readFile(new URL('./data/products.json', import.meta.url), 'utf8'));
const cart = new Map();                       // id -> { id, qty, note }

function send(res, status, data, headers = {}) {
  if (status === 204) { res.writeHead(204, headers); return res.end(); }
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), ...headers });
  res.end(res.req.method === 'HEAD' ? undefined : body);
}
function allow(res, methods) { send(res, 405, { error: 'method not allowed', allow: methods }, { Allow: methods.join(', ') }); }
function cartView() {
  const items = [...cart.values()].map(i => ({ ...i, name: products.find(p => p.id === i.id).name, price: products.find(p => p.id === i.id).price }));
  return { items, count: items.reduce((s, i) => s + i.qty, 0), total: items.reduce((s, i) => s + i.qty * i.price, 0) };
}
async function readJson(req, res) {
  const type = req.headers['content-type'] || '';
  let raw = ''; for await (const chunk of req) raw += chunk;
  if (!type.startsWith('application/json')) { send(res, 415, { error: 'send JSON', got: type || null }); return null; }
  try { return JSON.parse(raw); } catch (err) { send(res, 400, { error: 'body is not valid JSON', detail: err.message }); return null; }
}
async function sendFile(res, path) {
  const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
  if (!file.startsWith(ROOT) || /\/(server|node_modules)\/|\/\./.test(file)) return send(res, 404, { error: 'not found' });
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);
  const m = req.method;
  if (parts[0] !== 'api') return sendFile(res, url.pathname);
  const route = parts.slice(1).map(p => (/^\d+$/.test(p) ? ':id' : p)).join('/');
  const id = Number(parts.find(p => /^\d+$/.test(p)));

  if (route === 'echo') {                     // shows what the server received
    let raw = ''; for await (const chunk of req) raw += chunk;
    return send(res, 200, { method: m, path: url.pathname, query: Object.fromEntries(url.searchParams), headers: req.headers, body: raw });
  }
  if (route === 'boom') return send(res, 500, { error: 'something broke on the server' });
  if (route === 'v0/products') return send(res, 308, { moved: '/api/products' }, { Location: '/api/products' });

  if (route === 'products') {
    if (m !== 'GET' && m !== 'HEAD') return allow(res, ['GET', 'HEAD']);
    return send(res, 200, products, { 'X-Total-Count': String(products.length) });
  }
  if (route === 'products/:id') {
    if (m !== 'GET' && m !== 'HEAD') return allow(res, ['GET', 'HEAD']);
    const item = products.find(p => p.id === id);
    return item ? send(res, 200, item) : send(res, 404, { error: 'product not found', id: parts[2] });
  }
  if (route === 'cart') {
    if (m === 'GET' || m === 'HEAD') return send(res, 200, cartView());
    if (m === 'DELETE') { cart.clear(); return send(res, 204); }
    if (m === 'OPTIONS') return send(res, 204, null, { Allow: 'GET, HEAD, DELETE, OPTIONS' });
    return allow(res, ['GET', 'HEAD', 'DELETE', 'OPTIONS']);
  }
  if (route === 'cart/items') {
    if (m === 'OPTIONS') return send(res, 204, null, { Allow: 'POST, OPTIONS' });
    if (m !== 'POST') return allow(res, ['POST', 'OPTIONS']);
    const body = await readJson(req, res); if (!body) return;
    const p = products.find(x => x.id === body.id);
    if (!p) return send(res, 404, { error: 'product not found', id: body.id ?? null });
    const qty = body.qty ?? 1;
    if (!Number.isInteger(qty) || qty < 1) return send(res, 422, { error: 'qty must be a whole number from 1', qty });
    const now = (cart.get(p.id)?.qty || 0) + qty;
    if (now > p.stock) return send(res, 409, { error: 'not enough stock', stock: p.stock, wanted: now });
    cart.set(p.id, { id: p.id, qty: now, note: cart.get(p.id)?.note ?? '' });
    return send(res, 201, cart.get(p.id), { Location: `/api/cart/items/${p.id}` });
  }
  if (route === 'cart/items/:id') {
    const item = cart.get(id);
    if (m === 'OPTIONS') return send(res, 204, null, { Allow: 'GET, PUT, PATCH, DELETE, OPTIONS' });
    if (!['GET', 'PUT', 'PATCH', 'DELETE'].includes(m)) return allow(res, ['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    if (!item) return send(res, 404, { error: 'not in cart', id });
    if (m === 'GET') return send(res, 200, item);
    if (m === 'DELETE') { cart.delete(id); return send(res, 204); }
    const body = await readJson(req, res); if (!body) return;
    const next = m === 'PUT' ? { id, qty: body.qty, note: body.note } : { ...item, ...body, id };
    if (!Number.isInteger(next.qty) || next.qty < 1) return send(res, 422, { error: 'qty must be a whole number from 1', qty: next.qty ?? null });
    cart.set(id, next);
    return send(res, 200, next);
  }
  send(res, 404, { error: 'no such endpoint', path: url.pathname });
});

server.listen(PORT, () => console.info(`Siraj Shop API v2: http://localhost:${PORT}/api/products`));
