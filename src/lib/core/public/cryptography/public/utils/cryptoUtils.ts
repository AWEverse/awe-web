import {
  crypto_scalarmult,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_decrypt,
  memzero,
  randombytes_buf,
  to_string
} from "libsodium-wrappers";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2.js";

export const CONSTANTS = {
  KEY_LENGTH: 32,
  NONCE_LENGTH: 24,
  PROTOCOL_INFO: "X3DHProtocol_v2",
  ERROR_CODES: {
    INVALID_KEY_LENGTH: "X3DH_ERR_001",
    INVALID_PREKEY: "X3DH_ERR_002",
    INVALID_SIGNATURE: "X3DH_ERR_003",
    ENCRYPTION_FAILED: "X3DH_ERR_004",
    DECRYPTION_FAILED: "X3DH_ERR_005"
  }
} as const;

export class CryptoError extends Error {
  constructor(code: string, message: string) {
    super(`[${code}] ${message}`);
    this.name = "CryptoError";
  }
}

export function computeDH(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  try {
    return crypto_scalarmult(privateKey, publicKey);
  } catch (error) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.INVALID_KEY_LENGTH,
      "Invalid key length for DH computation"
    );
  }
}

export function deriveSharedSecret(
  dhOutputs: Uint8Array[],
  info: string = CONSTANTS.PROTOCOL_INFO
): Uint8Array {
  // Concatenate all DH outputs
  const totalLength = dhOutputs.reduce((sum, dh) => sum + dh.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;

  for (const dh of dhOutputs) {
    combined.set(dh, offset);
    offset += dh.length;
    memzero(dh); // Secure cleanup of individual DH outputs
  }

  const salt = new Uint8Array(CONSTANTS.KEY_LENGTH).fill(0);
  const derived = new Uint8Array(hkdf(sha256, combined, salt, info, CONSTANTS.KEY_LENGTH));

  memzero(combined);
  return derived;
}

export function generateNonce(): Uint8Array {
  return randombytes_buf(CONSTANTS.NONCE_LENGTH);
}

export function createAssociatedData(
  senderKey: Uint8Array,
  recipientKey: Uint8Array,
  additionalData?: { [key: string]: string }
): Uint8Array {
  // Base AD includes both identity keys
  const baseLength = senderKey.length + recipientKey.length;
  let adLength = baseLength;

  // If additional data present, include its serialized form
  let serializedExtra: Uint8Array | undefined;
  if (additionalData) {
    serializedExtra = new TextEncoder().encode(JSON.stringify(additionalData));
    adLength += serializedExtra.length;
  }

  const ad = new Uint8Array(adLength);
  ad.set(senderKey, 0);
  ad.set(recipientKey, senderKey.length);

  if (serializedExtra) {
    ad.set(serializedExtra, baseLength);
  }

  return ad;
}

export function encryptMessage(
  message: string | Uint8Array,
  key: Uint8Array,
  ad: Uint8Array
): { ciphertext: Uint8Array; nonce: Uint8Array } {
  const nonce = generateNonce();
  try {
    const ciphertext = crypto_aead_xchacha20poly1305_ietf_encrypt(
      message,
      ad,
      null,
      nonce,
      key
    );
    return { ciphertext: new Uint8Array(ciphertext), nonce };
  } catch (error) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.ENCRYPTION_FAILED,
      "Message encryption failed"
    );
  }
}

export function decryptMessage(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array,
  ad: Uint8Array
): string {
  try {
    const plaintext = crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      ad,
      nonce,
      key
    );
    return to_string(plaintext);
  } catch (error) {
    throw new CryptoError(
      CONSTANTS.ERROR_CODES.DECRYPTION_FAILED,
      "Message decryption failed"
    );
  }
}
