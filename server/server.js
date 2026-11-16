// Siraj Shop API v6 — a small local server for the book. Run: npm run api
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
const products = JSON.parse(await readFile(new URL('./data/products.json', import.meta.url), 'utf8'));
const reviews = JSON.parse(await readFile(new URL('./data/reviews.json', import.meta.url), 'utf8'));
const users = JSON.parse(await readFile(new URL('./data/users.json', import.meta.url), 'utf8'));
const carts = new Map();                      // one cart per browser: sid cookie -> Map
let cart;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const flaky = new Map();                      // key -> how many times it was called
const hits = new Map();                       // client -> recent request times (rate limit)
const done = new Map();                       // Idempotency-Key -> the answer we already gave
const SLOW_MS = Number(process.env.SLOW_MS) || 0;  // make every POST to the cart slow
const sessions = new Map();                   // login cookie: sid -> user id
const SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const TTL = Number(process.env.TOKEN_TTL) || 900;           // seconds
const API_KEY = process.env.API_KEY || 'key-dev-123';
const b64 = x => Buffer.from(JSON.stringify(x)).toString('base64url');
function sign(user) {
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const body = b64({ sub: user.id, name: user.name, role: user.role, exp: Math.floor(Date.now() / 1000) + TTL });
  return `${head}.${body}.${createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')}`;
}
function verify(token) {
  const [head, body, sig] = String(token).split('.');
  if (!sig) return { error: 'malformed token' };
  const good = createHmac('sha256', SECRET).update(`${head}.${body}`).digest();
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== good.length || !timingSafeEqual(got, good)) return { error: 'bad signature' };
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (claims.exp < Date.now() / 1000) return { error: 'token expired' };
  return { user: users.find(u => u.id === claims.sub) };
}
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(/;\s*/).filter(Boolean).map(c => c.split('=')));
function whoIs(req) {                          // Bearer token first, then the login cookie
  const auth = req.headers.authorization || '';
  if (auth) return auth.startsWith('Bearer ') ? verify(auth.slice(7)) : { error: 'use: Authorization: Bearer <token>' };
  const uid = sessions.get(cookies(req).session);
  return uid ? { user: users.find(u => u.id === uid) } : { error: 'login required' };
}
function unauthorized(res, error) { send(res, 401, { error }, { 'WWW-Authenticate': 'Bearer' }); }
function cartOf(req, res) {
  let sid = cookies(req).cart;
  if (!sid || !carts.has(sid)) { sid = randomUUID(); carts.set(sid, new Map()); res.setHeader('Set-Cookie', `cart=${sid}; Path=/; HttpOnly; SameSite=Lax`); }
  return carts.get(sid);
}
const ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5500').split(',');
function cors(req, res) {                                   // which other sites may read our answers
  const origin = req.headers.origin;
  if (origin && ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Location');
  }
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS' && req.headers['access-control-request-method']) {   // preflight
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, Idempotency-Key');
    res.setHeader('Access-Control-Max-Age', '600');
    res.writeHead(204); res.end();
    return true;
  }
  return false;
}                       // id -> { id, qty, note }

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
  if (cors(req, res)) return;
  if (url.pathname === '/api/visits') {                    // a cookie that counts visits
    const n = Number(/(?:^|; )visits=(\d+)/.exec(req.headers.cookie || '')?.[1] || 0) + 1;
    return send(res, 200, { visits: n, cookieSent: Boolean(req.headers.cookie) }, { 'Set-Cookie': `visits=${n}; Path=/; SameSite=Lax` });
  }
  const route = parts.slice(1).map(p => (/^\d+$/.test(p) ? ':id' : p)).join('/');
  const id = Number(parts.find(p => /^\d+$/.test(p)));

  if (route.startsWith('cart') || route === 'orders') cart = cartOf(req, res);
  if (route === 'login') {
    if (m !== 'POST') return allow(res, ['POST']);
    const body = await readJson(req, res); if (!body) return;
    const user = users.find(u => u.username === body.username && u.password === body.password);
    if (!user) return send(res, 401, { error: 'wrong username or password' });
    const sid = randomUUID(); sessions.set(sid, user.id);
    return send(res, 200, { token: sign(user), expiresIn: TTL, user: { id: user.id, name: user.name, role: user.role } },
      { 'Set-Cookie': `session=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL}` });
  }
  if (route === 'logout') { sessions.delete(cookies(req).session); return send(res, 204, null, { 'Set-Cookie': 'session=; Path=/; Max-Age=0' }); }
  if (route === 'me') {
    const who = whoIs(req);
    return who.user ? send(res, 200, { id: who.user.id, name: who.user.name, role: who.user.role }) : unauthorized(res, who.error);
  }
  if (route === 'admin/stock') {                // for servers and scripts: an API key, not a login
    const key = req.headers['x-api-key'];
    if (!key) return send(res, 401, { error: 'missing X-API-Key' });
    if (key !== API_KEY) return send(res, 403, { error: 'this key is not allowed' });
    return send(res, 200, products.map(p => ({ id: p.id, stock: p.stock })));
  }
  if (route === 'orders') {
    const who = whoIs(req);
    if (!who.user) return unauthorized(res, who.error);
    if (m === 'GET' && who.user.role !== 'admin') return send(res, 403, { error: 'admins only', role: who.user.role });
    if (m === 'GET') return send(res, 200, []);
    if (m !== 'POST') return allow(res, ['GET', 'POST']);
    const view = cartView();
    if (!view.count) return send(res, 409, { error: 'cart is empty' });
    cart.clear();
    return send(res, 201, { id: Date.now() % 100000, user: who.user.name, ...view }, {});
  }
  if (route === 'slow') {                       // answers after ?ms=
    await sleep(Math.min(Number(url.searchParams.get('ms')) || 1000, 10000));
    return send(res, 200, { waited: Number(url.searchParams.get('ms')) || 1000 });
  }
  if (route === 'flaky') {                      // fails ?fail= times for each ?key=, then works
    const key = url.searchParams.get('key') || 'x', n = (flaky.get(key) || 0) + 1; flaky.set(key, n);
    if (n <= (Number(url.searchParams.get('fail')) || 2)) return send(res, 503, { error: 'try again soon', attempt: n }, { 'Retry-After': '1' });
    return send(res, 200, { ok: true, attempt: n });
  }
  if (route === 'limited') {                    // 3 requests per 10 seconds per client
    const who = req.headers['x-client'] || req.socket.remoteAddress, now = Date.now();
    const recent = (hits.get(who) || []).filter(t => now - t < 10000); recent.push(now); hits.set(who, recent);
    if (recent.length > 3) return send(res, 429, { error: 'too many requests', limit: 3, window: '10s' }, { 'Retry-After': String(Math.ceil((10000 - (now - recent[0])) / 1000)) });
    return send(res, 200, { ok: true, used: recent.length, limit: 3 });
  }
  if (route === 'echo') {                     // shows what the server received
    let raw = ''; for await (const chunk of req) raw += chunk;
    return send(res, 200, { method: m, path: url.pathname, query: Object.fromEntries(url.searchParams), headers: req.headers, body: raw });
  }
  if (route === 'boom') return send(res, 500, { error: 'something broke on the server' });
  if (route === 'v0/products') return send(res, 308, { moved: '/api/products' }, { Location: '/api/products' });

  if (route === '') return send(res, 200, {                  // a tiny index of this API
    name: 'Siraj Shop API', version: 6,
    endpoints: ['GET /api/products?q=&category=&sort=price|-price|name', 'GET /api/products/:id', 'GET|POST /api/products/:id/reviews',
      'GET|DELETE /api/cart', 'POST /api/cart/items', 'GET|PUT|PATCH|DELETE /api/cart/items/:id', 'POST /api/login', 'GET /api/me', 'POST /api/logout', 'POST /api/orders (login)', 'GET /api/admin/stock (X-API-Key)'],
  });
  if (route === 'products') {
    if (m !== 'GET' && m !== 'HEAD') return allow(res, ['GET', 'HEAD']);
    const q = url.searchParams;
    const SORTS = { price: (a, b) => a.price - b.price, '-price': (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name, 'ar') };
    const sort = q.get('sort');
    if (sort && !SORTS[sort]) return send(res, 400, { error: 'unknown sort', sort, allowed: Object.keys(SORTS) });
    let list = products;
    if (q.get('q')) list = list.filter(p => p.name.includes(q.get('q').trim()));
    if (q.get('category')) list = list.filter(p => p.category === q.get('category'));
    if (sort) list = [...list].sort(SORTS[sort]);
    return send(res, 200, list, { 'X-Total-Count': String(list.length) });
  }
  if (route === 'products/:id/reviews') {
    const product = products.find(p => p.id === id);
    if (!product) return send(res, 404, { error: 'product not found', id });
    if (m === 'GET') return send(res, 200, reviews.filter(r => r.productId === id));
    if (m !== 'POST') return allow(res, ['GET', 'POST']);
    const body = await readJson(req, res); if (!body) return;
    if (!Number.isInteger(body.stars) || body.stars < 1 || body.stars > 5) return send(res, 422, { error: 'stars must be 1 to 5', stars: body.stars ?? null });
    const review = { id: reviews.length + 1, productId: id, stars: body.stars, text: String(body.text ?? '') };
    reviews.push(review);
    return send(res, 201, review, { Location: `/api/products/${id}/reviews/${review.id}` });
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
    const ikey = req.headers['idempotency-key'];
    if (ikey && done.has(ikey)) { const [st, data, hd] = done.get(ikey); await sleep(SLOW_MS); return send(res, st, data, { ...hd, 'Idempotent-Replay': 'true' }); }
    const body = await readJson(req, res); if (!body) return;
    const p = products.find(x => x.id === body.id);
    if (!p) return send(res, 404, { error: 'product not found', id: body.id ?? null });
    const qty = body.qty ?? 1;
    if (!Number.isInteger(qty) || qty < 1) return send(res, 422, { error: 'qty must be a whole number from 1', qty });
    const now = (cart.get(p.id)?.qty || 0) + qty;
    if (now > p.stock) return send(res, 409, { error: 'not enough stock', stock: p.stock, wanted: now });
    cart.set(p.id, { id: p.id, qty: now, note: cart.get(p.id)?.note ?? '' });
    const answer = [201, { ...cart.get(p.id) }, { Location: `/api/cart/items/${p.id}` }];
    if (ikey) done.set(ikey, answer);
    await sleep(Number(req.headers['x-delay']) || SLOW_MS);     // the work is done — the answer is late
    return send(res, ...answer);
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

server.listen(PORT, () => console.info(`Siraj Shop API v6: http://localhost:${PORT}/api/products`));
