import { X3DHError } from "..";
import { KeyPair, InitialMessage } from "../types";

const MLKEM_SS_SIZE = 32; // Adjust based on Kyber or ML-KEM variant

function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value == null) {
    throw new X3DHError(message, "INVALID_INPUT");
  }
  return value;
}

export function validateBytes(
  bytes: Uint8Array,
  expectedLength: number,
  name: string,
): void {
  requireValue(bytes, `${name} must not be null or undefined`);

  if (!(bytes instanceof Uint8Array)) {
    throw new X3DHError(`${name} must be a Uint8Array`, "INVALID_INPUT");
  }

  if (bytes.length !== expectedLength) {
    throw new X3DHError(
      `${name} must be ${expectedLength} bytes, got ${bytes.length}`,
      "INVALID_LENGTH",
    );
  }
}

export function validateKeyPair(
  keyPair: KeyPair,
  publicKeyLength: number,
  privateKeyLength: number,
  name: string,
): void {
  validateBytes(
    requireValue(keyPair.publicKey, `${name} public key must be defined`),
    publicKeyLength,
    `${name} public key`,
  );

  validateBytes(
    requireValue(keyPair.privateKey, `${name} private key must be defined`),
    privateKeyLength,
    `${name} private key`,
  );
}

export function validateInitialMessage(message: InitialMessage): void {
  const senderIdentityKey = requireValue(
    message.senderIdentityKeyX25519,
    "Invalid InitialMessage: Missing sender identity key.",
  );
  const ephemeralKey = requireValue(
    message.ephemeralKeyEC,
    "Invalid InitialMessage: Missing ephemeral key.",
  );
  const pqEncapsulations = requireValue(
    message.pqEncapsulations,
    "Invalid InitialMessage: Missing PQ encapsulations.",
  );

  validateBytes(senderIdentityKey, 32, "Sender identity key (X25519)");
  validateBytes(ephemeralKey, 32, "Ephemeral key (Curve25519)");

  const identityEncapsulation = requireValue(
    pqEncapsulations.identity,
    "Invalid InitialMessage: Missing PQ identity encapsulation.",
  );
  const signedPreKeyEncapsulation = requireValue(
    pqEncapsulations.signedPreKey,
    "Invalid InitialMessage: Missing PQ signed pre-key encapsulation.",
  );

  validateBytes(
    identityEncapsulation,
    MLKEM_SS_SIZE,
    "PQ identity encapsulation",
  );
  validateBytes(
    signedPreKeyEncapsulation,
    MLKEM_SS_SIZE,
    "PQ signed pre-key encapsulation",
  );

  if (pqEncapsulations.oneTimePreKey) {
    validateBytes(
      pqEncapsulations.oneTimePreKey,
      MLKEM_SS_SIZE,
      "PQ one-time pre-key encapsulation",
    );
  }
}
