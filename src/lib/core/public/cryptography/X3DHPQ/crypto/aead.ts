import sodium from 'libsodium-wrappers';
import { AEADError } from '../protocol/errors';

const KEY_LENGTH = sodium.crypto_aead_xchacha20poly1305_ietf_KEYBYTES; // 32
const NONCE_LENGTH = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES; // 24
const SUPPORTED_VERSION = 1;

export interface EncryptedInitialMessage {
  version: number;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
}

function validateBytes(bytes: Uint8Array, expectedLength: number, name: string): void {
  if (!(bytes instanceof Uint8Array)) {
    throw new AEADError(`${name} must be a Uint8Array`, 'INVALID_INPUT');
  }
  if (bytes.length !== expectedLength) {
    throw new AEADError(`${name} must be ${expectedLength} bytes, got ${bytes.length}`, 'INVALID_LENGTH');
  }
}

function validatePlaintext(plaintext: object): void {
  if (plaintext == null || typeof plaintext !== 'object') {
    throw new AEADError('Plaintext must be a non-null object', 'INVALID_PLAINTEXT');
  }
  try {
    JSON.stringify(plaintext);
  } catch {
    throw new AEADError('Plaintext must be JSON-serializable', 'INVALID_PLAINTEXT');
  }
}

export async function encryptInitialMessage<T extends object>(
  key: Uint8Array,
  plaintext: T,
  associatedData: Uint8Array | null,
  version: number = SUPPORTED_VERSION
): Promise<EncryptedInitialMessage> {
  await sodium.ready;
  try {
    validateBytes(key, KEY_LENGTH, 'Key');
    validatePlaintext(plaintext);

    if (associatedData != null) {
      validateBytes(associatedData, associatedData.length, 'Associated data');
    }

    if (version !== SUPPORTED_VERSION) {
      throw new AEADError(`Unsupported version: ${version}`, 'INVALID_VERSION');
    }

    const nonce = sodium.randombytes_buf(NONCE_LENGTH);
    const encoded = new TextEncoder().encode(JSON.stringify(plaintext));

    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      encoded,
      associatedData,
      null,
      nonce,
      key
    );

    return {
      version,
      nonce: new Uint8Array(nonce),
      ciphertext: new Uint8Array(ciphertext),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new AEADError(`Encryption failed: ${msg}`, 'ENCRYPTION_FAILED');
  }
}

export async function decryptInitialMessage<T extends object>(
  key: Uint8Array,
  encrypted: EncryptedInitialMessage,
  associatedData: Uint8Array | null = new Uint8Array(0),
): Promise<T> {
  await sodium.ready;
  try {
    validateBytes(key, KEY_LENGTH, 'Key');
    if (!encrypted || typeof encrypted !== 'object') {
      throw new AEADError('Encrypted message must be a valid object', 'INVALID_INPUT');
    }

    validateBytes(encrypted.nonce, NONCE_LENGTH, 'Nonce');
    validateBytes(encrypted.ciphertext, encrypted.ciphertext.length, 'Ciphertext');
    if (encrypted.version !== SUPPORTED_VERSION) {
      throw new AEADError(`Unsupported version: ${encrypted.version}`, 'INVALID_VERSION');
    }
    if (associatedData != null) {
      validateBytes(associatedData, associatedData.length, 'Associated data');
    }

    const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encrypted.ciphertext,
      associatedData,
      encrypted.nonce,
      key
    );

    const plaintextString = new TextDecoder().decode(decrypted);
    const plaintext = JSON.parse(plaintextString);

    if (typeof plaintext !== 'object' || plaintext == null) {
      throw new AEADError('Decrypted plaintext is not a valid object', 'INVALID_PLAINTEXT');
    }

    return plaintext as T;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    throw new AEADError(`Decryption failed: ${msg}`, 'DECRYPTION_FAILED');
  }
}
