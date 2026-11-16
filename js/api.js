// every request to the shop API goes through this file
const BASE = import.meta.env?.VITE_API_BASE ?? '/api';   // Vite fills it in; served by the API server it stays /api
export class ApiError extends Error {
  name = 'ApiError';
  constructor(code, message, { status = 0, details = null } = {}) { super(message); Object.assign(this, { code, status, details }); }
}
const CODES = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 413: 'TOO_LARGE', 415: 'BAD_TYPE', 422: 'INVALID', 429: 'RATE_LIMITED' };
export async function request(path, { method = 'GET', body, timeout = 5000, signal, as = 'json' } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body && JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeout)]) : AbortSignal.timeout(timeout),
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;                          // the page cancelled it (a newer search)
    if (err.name === 'TimeoutError') throw new ApiError('TIMEOUT', `no answer in ${timeout} ms`);
    throw new ApiError('NETWORK', 'cannot reach the server');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(CODES[res.status] ?? (res.status >= 500 ? 'SERVER' : 'HTTP'), data?.error ?? res.statusText, { status: res.status, details: data });
  }
  if (as === 'blob') return { blob: await res.blob(), name: /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] };
  const data = res.status === 204 ? null : await res.json();
  if (data?.errors) throw new ApiError(data.errors[0].extensions?.code ?? 'GRAPHQL', data.errors[0].message, { status: res.status, details: data.data });
  return data;
}
export class ShapeError extends Error { name = 'ShapeError'; }
const TYPES = { int: Number.isInteger, string: v => typeof v === 'string' };
export function check(value, spec, path) {                 // the answer must look like what the page expects
  if (Array.isArray(spec)) {
    if (!Array.isArray(value)) throw new ShapeError(`${path}: expected a list`);
    value.forEach((v, i) => check(v, spec[0], `${path}[${i}]`));
  } else if (typeof spec === 'object') {
    if (typeof value !== 'object' || value === null) throw new ShapeError(`${path}: expected an object`);
    for (const [key, s] of Object.entries(spec)) check(value[key], s, `${path}.${key}`);
  } else if (!TYPES[spec](value)) {
    throw new ShapeError(`${path}: expected ${spec}, got ${JSON.stringify(value)}`);
  }
  return value;
}
const Product = { id: 'int', name: 'string', price: 'int', stock: 'int' };
const qs = params => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
  return s ? '?' + s : '';
};
export const api = {
  products: {
    list: async (params = {}, opts) => check(await request('/products' + qs(params), opts), [Product], 'products'),
  },
  cart: {
    get: () => request('/cart'),
    add: (id, qty = 1) => request('/cart/items', { method: 'POST', body: { id, qty }, timeout: 3000 }),
    receipt: () => request('/cart/receipt', { as: 'blob' }),
  },
  graphql: async (query, variables) => (await request('/graphql', { method: 'POST', body: { query, variables } })).data,
  stockStream: () => new EventSource(BASE + '/stock/stream'),
};
