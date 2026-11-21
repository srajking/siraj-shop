// api.ts — one way to ask the server, and one error type for each way it can fail
export class HttpError extends Error {
  readonly status: number

  constructor(status: number, url: string) {
    super('HTTP ' + status + ' — ' + url)
    this.name = 'HttpError'
    this.status = status
  }
}

export class DataError extends Error {                         // the answer came, in the wrong shape
  constructor(url: string) {
    super('unexpected data from ' + url)
    this.name = 'DataError'
  }
}

export async function getJson<T>(
  url: string,
  check: (data: unknown) => data is T,                         // the caller says what T looks like
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new HttpError(res.status, url)            // 404, 500: not data
  const data: unknown = await res.json()
  if (!check(data)) throw new DataError(url)                   // checked, not trusted
  return data
}
