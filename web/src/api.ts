// api.ts — one way to ask the server, and one error type when it says no
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, url: string) {
    super('HTTP ' + status + ' — ' + url)
    this.name = 'HttpError'
    this.status = status
  }
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new HttpError(res.status, url)            // 404, 500: not data
  return res.json()                                            // trusted for now — checked in chapter 13
}
