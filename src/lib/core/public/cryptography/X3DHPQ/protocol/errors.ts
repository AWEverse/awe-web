import SmartError from "@/lib/core/private/debug/SmartError";

/** Custom error for X3DH+PQ protocol */
export class X3DHError extends SmartError {
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
