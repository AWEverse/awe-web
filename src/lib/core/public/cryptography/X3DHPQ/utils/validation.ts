import { InitialMessage, KeyPair, X3DHError } from "..";

export function validateInitialMessage(message: InitialMessage): void {
  if (!message || !message.senderIdentityKeyX25519 || !message.ephemeralKeyEC) {
    throw new X3DHError("Invalid InitialMessage: Missing required keys.", "INVALID_MESSAGE");
  }

  if (!message.pqEncapsulations || !message.pqEncapsulations.identity || !message.pqEncapsulations.signedPreKey) {
    throw new X3DHError("Invalid InitialMessage: Missing PQ encapsulations.", "INVALID_MESSAGE");
  }

  if (message.pqEncapsulations.oneTimePreKey && !message.pqEncapsulations.oneTimePreKey.length) {
    throw new X3DHError("Invalid InitialMessage: OneTimePreKey is empty.", "INVALID_MESSAGE");
  }
}

export function validateBytes(
  bytes: Uint8Array,
  expectedLength: number,
  name: string
): void {
  if (!(bytes instanceof Uint8Array)) {
    throw new X3DHError(`${name} must be a Uint8Array`, "INVALID_INPUT");
  }
  if (bytes.length !== expectedLength) {
    throw new X3DHError(
      `${name} must be ${expectedLength} bytes, got ${bytes.length}`,
      "INVALID_LENGTH"
    );
  }
}

export function validateKeyPair(
  keyPair: KeyPair,
  publicKeyLength: number,
  privateKeyLength: number,
  name: string
): void {
  if (!(keyPair.publicKey instanceof Uint8Array)) {
    throw new X3DHError(`${name} public key must be Uint8Array`, "INVALID_KEY");
  }
  if (!(keyPair.privateKey instanceof Uint8Array)) {
    throw new X3DHError(`${name} private key must be Uint8Array`, "INVALID_KEY");
  }
  if (keyPair.publicKey.length !== publicKeyLength) {
    throw new X3DHError(
      `${name} public key length invalid: expected ${publicKeyLength}, got ${keyPair.publicKey.length}`,
      "INVALID_KEY_LENGTH"
    );
  }
  if (keyPair.privateKey.length !== privateKeyLength) {
    throw new X3DHError(
      `${name} private key length invalid: expected ${privateKeyLength}, got ${keyPair.privateKey.length}`,
      "INVALID_KEY_LENGTH"
    );
  }
}
