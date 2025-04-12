/** Custom error for X3DH+PQ protocol */
export class X3DHError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "X3DHError";
  }
}

export class AEADError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AEADError"
  }
}
