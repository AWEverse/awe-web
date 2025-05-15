
export default class NonThrowableError extends Error {
  constructor(code: string, message: string) {
    super(`[${code}] ${message}`);
    this.name = "CryptoError";
  }
}
