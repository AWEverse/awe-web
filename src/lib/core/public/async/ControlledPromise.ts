/**
 * A custom promise that allows manual resolution and rejection.
 * This class provides better control over the promise's state.
 *
 * @template T The type of the value the promise resolves with.
 */
export default class ControlledPromise<T = void> {
  /**
   * The underlying promise object.
   * @internal
   */
  private _promise: Promise<T>;

  /**
   * The resolve function for the promise.
   * @internal
   */
  private _resolve!: (value: T | PromiseLike<T>) => void;

  /**
   * The reject function for the promise.
   * @internal
   */
  private _reject!: (reason?: any) => void;

  /**
   * Creates a new instance of ControlledPromise.
   * The promise will be resolved or rejected manually via the `resolve` and `reject` methods.
   */
  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Gets the underlying promise object.
   *
   * @returns {Promise<T>} The promise object that resolves with the specified type `T`.
   */
  get promise(): Promise<T> {
    return this._promise;
  }

  /**
   * Resolves the promise with a given value.
   *
   * @param {T | PromiseLike<T>} value The value to resolve the promise with.
   */
  resolve(value: T | PromiseLike<T>): void {
    this._resolve(value);
  }

  /**
   * Rejects the promise with a given reason.
   *
   * @param {any} [reason] The reason the promise is being rejected.
   */
  reject(reason?: any): void {
    this._reject(reason);
  }

  /**
   * Creates and resolves a new `ControlledPromise` instance immediately.
   * @template T The type of the resolved value.
   * @returns {ControlledPromise<T | void>} A new instance of `ControlledPromise` that is already resolved.
   */
  static fulfilled(): ControlledPromise<void>;
  static fulfilled<T>(value: T): ControlledPromise<T>;
  static fulfilled<T>(value?: T): ControlledPromise<T | void> {
    const instance = new ControlledPromise<T | void>();
    instance.resolve(value);
    return instance;
  }
}
