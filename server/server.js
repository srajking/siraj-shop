// Siraj Shop API v11 — a small local server for the book. Run: npm run api
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { EventEmitter } from 'node:events';

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
const JITTER = process.env.SEARCH_JITTER === '1';
const MAX_AGE = process.env.CACHE_MAX_AGE ?? '30';         // seconds a browser may reuse product answers
const stats = new Map();                      // path -> how many requests reached the server
const MAX_UPLOAD = Number(process.env.MAX_UPLOAD) || 2 * 1024 * 1024;   // bytes per request
const IMAGES = ['image/png', 'image/jpeg', 'image/webp'];
const uploads = new Map();                    // id -> { filename, type, data }
const bus = new EventEmitter(); bus.setMaxListeners(0);   // stock changes, for everyone who listens
let stockState = { version: 1, at: Date.now() };
const LONGPOLL_MS = Number(process.env.LONGPOLL_MS) || 25000;   // how long a long poll may wait
const SSE_RETRY = Number(process.env.SSE_RETRY) || 2000;       // ms before EventSource reconnects
const live = { sse: 0 };
const streams = new Set();                    // open SSE answers
const stockNow = () => ({ version: stockState.version, at: stockState.at, stock: products.map(p => ({ id: p.id, stock: p.stock })) });
function changeStock(p, stock) {
  p.stock = stock;
  stockState = { version: stockState.version + 1, at: Date.now() };
  bus.emit('stock', stockNow());
}
const PAGE_DELAY = Number(process.env.PAGE_DELAY) || 0;     // make every page of reviews slow
const cursorOf = id => Buffer.from('id:' + id).toString('base64url');     // opaque to the client
const idOf = c => Number(/^id:(\d+)$/.exec(Buffer.from(String(c), 'base64url').toString())?.[1]);
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
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Location, Content-Disposition');
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
function cached(req, res, data) {             // ETag + Cache-Control for answers that rarely change
  const body = JSON.stringify(data);
  const etag = '"' + createHash('sha1').update(body).digest('base64url').slice(0, 16) + '"';
  const headers = { ETag: etag, 'Cache-Control': MAX_AGE === 'no-cache' ? 'no-cache' : `max-age=${MAX_AGE}` };
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, headers); return res.end(); }
  return send(res, 200, data, headers);
}
function allow(res, methods) { send(res, 405, { error: 'method not allowed', allow: methods }, { Allow: methods.join(', ') }); }
const DISCOUNT = { LIMIT: 10000, RATE: 0.9 };   // js/cart.js: Cart.LIMIT and Cart.RATE
function cartView() {
  const items = [...cart.values()].map(i => ({ ...i, name: products.find(p => p.id === i.id).name, price: products.find(p => p.id === i.id).price }));
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal >= DISCOUNT.LIMIT ? Math.round(subtotal * DISCOUNT.RATE) : subtotal;   // the same rule the page uses
  return { items, count: items.reduce((s, i) => s + i.qty, 0), subtotal, total };
}
async function readJson(req, res) {
  const type = req.headers['content-type'] || '';
  let raw = ''; for await (const chunk of req) raw += chunk;
  if (!type.startsWith('application/json')) { send(res, 415, { error: 'send JSON', got: type || null }); return null; }
  try { return JSON.parse(raw); } catch (err) { send(res, 400, { error: 'body is not valid JSON', detail: err.message }); return null; }
}
async function readRaw(req) {                 // the whole body as bytes
  const chunks = []; for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}
function parseMultipart(buf, type) {          // FormData on the wire: parts between --boundary lines
  const b = /boundary=(?:"([^"]+)"|([^;]+))/.exec(type);
  if (!b) return null;
  const sep = Buffer.from('--' + (b[1] || b[2])), parts = [];
  let i = buf.indexOf(sep);
  while (i !== -1) {
    const start = i + sep.length;
    if (buf.subarray(start, start + 2).toString() === '--') break;
    const next = buf.indexOf(sep, start);
    if (next === -1) break;
    const part = buf.subarray(start + 2, next - 2), h = part.indexOf('\r\n\r\n'), head = part.subarray(0, h).toString();
    parts.push({ name: /name="([^"]*)"/.exec(head)?.[1], filename: /filename="([^"]*)"/.exec(head)?.[1], type: /content-type:\s*([^\r\n]+)/i.exec(head)?.[1], data: part.subarray(h + 4) });
    i = next;
  }
  return parts;
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
  if (url.pathname === '/api/stats') {                    // how many requests reached the server
    if (req.method === 'DELETE') { stats.clear(); return send(res, 204); }
    return send(res, 200, Object.fromEntries(stats));
  }
  stats.set(url.pathname + url.search, (stats.get(url.pathname + url.search) || 0) + 1);
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
    name: 'Siraj Shop API', version: 11,
    endpoints: ['GET /api/products?q=&category=&sort=price|-price|name', 'GET /api/products/:id', 'GET|POST /api/products/:id/reviews', 'GET /api/reviews?product=&limit=&page= | &after=', 'GET /api/reviews/summary?product=', 'POST /api/uploads (FormData: file)', 'GET /api/uploads/:id', 'GET /api/cart/receipt (CSV)', 'GET /api/stock', 'GET /api/stock/changes?since= (long poll)', 'GET /api/stock/stream (SSE)', 'WS /api/live', 'PATCH /api/admin/stock/:id (X-API-Key)',
      'GET|DELETE /api/cart', 'POST /api/cart/items', 'GET|PUT|PATCH|DELETE /api/cart/items/:id', 'POST /api/login', 'GET /api/me', 'POST /api/logout', 'POST /api/orders (login)', 'GET /api/admin/stock (X-API-Key)'],
  });
  if (route === 'products') {
    if (m !== 'GET' && m !== 'HEAD') return allow(res, ['GET', 'HEAD']);
    const q = url.searchParams;
    const SORTS = { price: (a, b) => a.price - b.price, '-price': (a, b) => b.price - a.price, name: (a, b) => a.name.localeCompare(b.name, 'ar') };
    const sort = q.get('sort');
    if (sort && !SORTS[sort]) return send(res, 400, { error: 'unknown sort', sort, allowed: Object.keys(SORTS) });
    const delay = Number(q.get('delay')) || (JITTER && q.has('q') ? Math.max(100, 900 - 300 * q.get('q').length) : 0);
    if (delay) await sleep(Math.min(delay, 10000));
    let list = products;
    if (q.get('q')) list = list.filter(p => p.name.includes(q.get('q').trim()));
    if (q.get('category')) list = list.filter(p => p.category === q.get('category'));
    if (sort) list = [...list].sort(SORTS[sort]);
    res.setHeader('X-Total-Count', String(list.length));
    return cached(req, res, list);
  }
  if (route === 'connections') return send(res, 200, { sse: live.sse, ws: sockets.size });
  if (route === 'stock') return cached(req, res, stockNow());
  if (route === 'stock/changes') {              // long poll: answer now if newer, else wait for a change
    const since = Number(url.searchParams.get('since')) || 0;
    if (stockState.version > since) return send(res, 200, stockNow());
    const done = s => { clearTimeout(timer); bus.off('stock', done); if (!res.writableEnded) send(res, 200, s); };
    const timer = setTimeout(() => { bus.off('stock', done); send(res, 204); }, LONGPOLL_MS);
    bus.on('stock', done);
    req.on('close', () => { clearTimeout(timer); bus.off('stock', done); });
    return;
  }
  if (route === 'stock/stream') {               // Server-Sent Events: one long answer, many messages
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const last = Number(req.headers['last-event-id']) || null;
    res.write(`retry: ${SSE_RETRY}\n\n`);
    const push = (s, extra = {}) => res.write(`id: ${s.version}\nevent: stock\ndata: ${JSON.stringify({ ...s, ...extra })}\n\n`);
    if (!last || last < stockState.version) push(stockNow(), { lastEventId: last });   // new, or missed something
    const beat = setInterval(() => res.write(': still here\n\n'), 15000);
    bus.on('stock', push); live.sse++; streams.add(res);
    req.on('close', () => { bus.off('stock', push); clearInterval(beat); live.sse--; streams.delete(res); });
    return;
  }
  if (route === 'admin/drop') {                 // cut every SSE connection, like a network drop
    if (req.headers['x-api-key'] !== API_KEY) return send(res, 401, { error: 'missing or wrong X-API-Key' });
    const n = streams.size; for (const r of streams) r.destroy();
    return send(res, 200, { dropped: n });
  }
  if (route === 'admin/stock/:id') {            // change the stock of one product
    if (req.headers['x-api-key'] !== API_KEY) return send(res, 401, { error: 'missing or wrong X-API-Key' });
    if (m !== 'PATCH') return allow(res, ['PATCH']);
    const p = products.find(x => x.id === id);
    if (!p) return send(res, 404, { error: 'product not found', id });
    const body = await readJson(req, res); if (!body) return;
    if (!Number.isInteger(body.stock) || body.stock < 0) return send(res, 422, { error: 'stock must be a whole number from 0' });
    changeStock(p, body.stock);
    return send(res, 200, { id, stock: p.stock, version: stockState.version });
  }
  if (route === 'uploads') {                    // FormData with one or more "file" fields
    if (m !== 'POST') return allow(res, ['POST']);
    const type = req.headers['content-type'] || '';
    const raw = await readRaw(req);
    if (!type.startsWith('multipart/form-data')) return send(res, 415, { error: 'send FormData (multipart/form-data)', got: type || null });
    if (raw.length > MAX_UPLOAD) return send(res, 413, { error: 'too large', max: MAX_UPLOAD, got: raw.length });
    const parts = parseMultipart(raw, type);
    if (!parts) return send(res, 400, { error: 'no boundary in Content-Type', got: type });
    const files = parts.filter(p => p.filename !== undefined);
    if (!files.length) return send(res, 400, { error: 'no file in the form' });
    const bad = files.find(f => !IMAGES.includes(f.type));
    if (bad) return send(res, 415, { error: 'images only', file: bad.filename, type: bad.type, allowed: IMAGES });
    const saved = files.map(f => {
      const fid = uploads.size + 1; uploads.set(fid, f);
      return { id: fid, name: f.filename, type: f.type, size: f.data.length, url: `/api/uploads/${fid}` };
    });
    return send(res, 201, { files: saved }, { Location: saved[0].url });
  }
  if (route === 'uploads/:id') {
    const f = uploads.get(id);
    if (!f) return send(res, 404, { error: 'no such upload', id });
    res.writeHead(200, { 'Content-Type': f.type, 'Content-Length': f.data.length });
    return res.end(f.data);
  }
  if (route === 'cart/receipt') {               // the cart as a CSV file
    const v = cartView();
    if (!v.count) return send(res, 409, { error: 'cart is empty' });
    const rows = [['product', 'qty', 'price', 'line'], ...v.items.map(i => [i.name, i.qty, i.price, i.qty * i.price]), ['subtotal', v.count, '', v.subtotal], ['total', '', '', v.total]];
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n') + '\r\n';   // BOM: Excel reads it as UTF-8
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="siraj-receipt.csv"', 'Content-Length': Buffer.byteLength(csv) });
    return res.end(csv);
  }
  if (route === 'reviews/summary') {
    const list = url.searchParams.get('product') ? reviews.filter(r => r.productId === Number(url.searchParams.get('product'))) : reviews;
    const avg = list.length ? Math.round(10 * list.reduce((s, r) => s + r.stars, 0) / list.length) / 10 : null;
    return send(res, 200, { count: list.length, avg });
  }
  if (route === 'reviews') {                    // newest first, one page at a time
    if (m !== 'GET' && m !== 'HEAD') return allow(res, ['GET', 'HEAD']);
    const q = url.searchParams;
    const limit = q.has('limit') ? Number(q.get('limit')) : 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) return send(res, 400, { error: 'limit must be 1 to 50', limit: q.get('limit') });
    let list = [...reviews].sort((a, b) => b.id - a.id);
    if (q.get('product')) list = list.filter(r => r.productId === Number(q.get('product')));
    if (PAGE_DELAY) await sleep(PAGE_DELAY);
    res.setHeader('X-Total-Count', String(list.length));
    if (q.has('page')) {                        // offset: skip (page - 1) * limit
      const page = Number(q.get('page'));
      if (!Number.isInteger(page) || page < 1) return send(res, 400, { error: 'page starts at 1', page: q.get('page') });
      return send(res, 200, { items: list.slice((page - 1) * limit, page * limit), page, limit, total: list.length, pages: Math.ceil(list.length / limit) });
    }
    let start = 0;                              // cursor: continue after the last one you saw
    if (q.get('after')) {
      const last = idOf(q.get('after'));
      if (!last) return send(res, 400, { error: 'bad cursor', after: q.get('after') });
      start = list.findIndex(r => r.id < last);
      if (start < 0) start = list.length;
    }
    const items = list.slice(start, start + limit);
    return send(res, 200, { items, next: start + limit < list.length ? cursorOf(items.at(-1).id) : null });
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
    return item ? cached(req, res, item) : send(res, 404, { error: 'product not found', id: parts[2] });
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

// WebSocket on /api/live: both sides may send at any time
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const sockets = new Set();                    // { socket, watching }
function wsSend(client, msg) {
  if (client.socket.destroyed) return;
  const data = Buffer.from(JSON.stringify(msg));
  const head = data.length < 126 ? Buffer.from([0x81, data.length]) : Buffer.from([0x81, 126, data.length >> 8, data.length & 255]);
  client.socket.write(Buffer.concat([head, data]));
}
function viewers(id) {
  if (id == null) return;
  const watching = [...sockets].filter(c => c.watching === id);
  for (const c of watching) wsSend(c, { type: 'viewers', id, count: watching.length });
}
function onMessage(client, text) {
  let msg;
  try { msg = JSON.parse(text); } catch { return wsSend(client, { type: 'error', error: 'send JSON', got: text }); }
  if (msg.type === 'ping') return wsSend(client, { type: 'pong', t: msg.t });
  if (msg.type === 'watch') { const old = client.watching; client.watching = msg.id; viewers(old); return viewers(msg.id); }
  wsSend(client, { type: 'error', error: 'unknown type', got: msg.type ?? null });
}
bus.on('stock', s => { for (const c of sockets) wsSend(c, { type: 'stock', ...s }); });
server.on('upgrade', (req, socket) => {
  if (new URL(req.url, 'http://x').pathname !== '/api/live' || req.headers.upgrade?.toLowerCase() !== 'websocket') return socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  const accept = createHash('sha1').update(req.headers['sec-websocket-key'] + GUID).digest('base64');
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);
  const client = { socket, watching: null };
  sockets.add(client);
  wsSend(client, { type: 'hello', clients: sockets.size });
  let buf = Buffer.alloc(0);
  socket.on('data', chunk => {                // frames from the browser are masked
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= 2) {
      const op = buf[0] & 15;
      let len = buf[1] & 127, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; } else if (len === 127) return socket.destroy();
      if (buf.length < off + 4 + len) return;
      const mask = buf.subarray(off, off + 4), data = Buffer.from(buf.subarray(off + 4, off + 4 + len)).map((b, i) => b ^ mask[i % 4]);
      buf = buf.subarray(off + 4 + len);
      if (op === 8) return socket.end(Buffer.from([0x88, 0]));
      if (op === 1) onMessage(client, data.toString());
    }
  });
  const bye = () => { if (sockets.delete(client)) viewers(client.watching); };
  socket.on('close', bye); socket.on('error', bye);
});

server.listen(PORT, () => console.info(`Siraj Shop API v11: http://localhost:${PORT}/api/products`));
