export type CryptoResult<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export namespace CryptoIO {
  export function success<T>(value: T): CryptoResult<T, never> {
    return { ok: true, value };
  }

  export function failure<E>(error: E): CryptoResult<never, E> {
    return { ok: false, error };
  }

  export function wrap<T>(fn: () => T): CryptoResult<T, unknown> {
    try {
      return success(fn());
    } catch (e) {
      return failure(e);
    }
  }

  export async function wrapAsync<T>(
    fn: () => Promise<T>,
  ): Promise<CryptoResult<T, unknown>> {
    try {
      const value = await fn();
      return success(value);
    } catch (e) {
      return failure(e);
    }
  }

  export function map<T, U, E>(
    res: CryptoResult<T, E>,
    fn: (v: T) => U,
  ): CryptoResult<U, E> {
    return res.ok ? success(fn(res.value)) : res;
  }

  export function flatMap<T, U, E>(
    res: CryptoResult<T, E>,
    fn: (v: T) => CryptoResult<U, E>,
  ): CryptoResult<U, E> {
    return res.ok ? fn(res.value) : res;
  }

  export function unwrap<T, E>(res: CryptoResult<T, E>): T {
    if (!res.ok) throw new Error(`Unwrap failed: ${String(res.error)}`);
    return res.value;
  }

  export function unwrapOr<T, E>(res: CryptoResult<T, E>, fallback: T): T {
    return res.ok ? res.value : fallback;
  }

  export function isError<T, E>(
    res: CryptoResult<T, E>,
  ): res is { ok: false; error: E } {
    return !res.ok;
  }
}
