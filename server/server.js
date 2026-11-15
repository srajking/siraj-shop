// Siraj Shop API — a small local server for the book. Run: npm run api
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT) || 4000;
const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };

const products = JSON.parse(await readFile(new URL('./data/products.json', import.meta.url), 'utf8'));

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

async function sendFile(res, path) {
  const file = normalize(join(ROOT, path === '/' ? 'index.html' : path));
  if (!file.startsWith(ROOT) || /\/(server|node_modules)\/|\/\./.test(file)) return send(res, 404, { error: 'not found' });
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);       // '/api/products/2' -> ['api', 'products', '2']
  if (parts[0] !== 'api') return sendFile(res, url.pathname);
  if (parts[1] === 'products' && parts.length === 2) return send(res, 200, products);
  if (parts[1] === 'products' && parts.length === 3) {
    const item = products.find(p => p.id === Number(parts[2]));
    return item ? send(res, 200, item) : send(res, 404, { error: 'product not found', id: parts[2] });
  }
  send(res, 404, { error: 'no such endpoint', path: url.pathname });
});

server.listen(PORT, () => console.info(`Siraj Shop API: http://localhost:${PORT}/api/products`));
