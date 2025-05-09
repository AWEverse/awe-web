import {
  crypto_aead_xchacha20poly1305_ietf_decrypt,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
  crypto_box_keypair,
  crypto_generichash,
  crypto_scalarmult,
  is_zero,
  memzero,
  randombytes_buf,
} from "libsodium-wrappers";
import { DHKeyPair } from "..";
import hkdf from "./hkdf";
import {
  INFO_RK,
  INFO_HEADER,
  CHAIN_CONSTANT_1,
  CHAIN_CONSTANT_2,
} from "../config";

// Reusable TextEncoder/Decoder instances for performance
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Cryptographic operations for the Double Ratchet Protocol
 * Optimized using libsodium for security and performance
 */
export default {
  /**
   * Generate a new X25519 DH key pair
   * @returns {DHKeyPair} Public and private key pair
   */
  generateDH(): DHKeyPair {
    return crypto_box_keypair();
  },

  /**
   * Perform X25519 Diffie-Hellman key agreement
   * @param {DHKeyPair} dhPair - Local key pair
   * @param {Uint8Array} publicKey - Remote public key
   * @returns {Uint8Array} 32-byte shared secret
   * @throws {Error} If inputs are invalid or DH fails
   */
  dh(dhPair: DHKeyPair, publicKey: Uint8Array): Uint8Array {
    if (
      !(dhPair.privateKey instanceof Uint8Array) ||
      !(publicKey instanceof Uint8Array) ||
      dhPair.privateKey.length !== 32 ||
      publicKey.length !== 32
    ) {
      throw new Error("Invalid DH key lengths");
    }

    const sharedSecret = crypto_scalarmult(dhPair.privateKey, publicKey);

    if (is_zero(sharedSecret)) {
      throw new Error("Invalid public key - shared secret is zero");
    }

    return sharedSecret;
  },

  /**
   * Derive root and chain keys using HKDF
   * @param {Uint8Array} rk - Current root key
   * @param {Uint8Array} dhOut - DH output
   * @returns {[Uint8Array, Uint8Array]} New root key and chain key
   */
  kdfRK(rk: Uint8Array, dhOut: Uint8Array): [Uint8Array, Uint8Array] {
    if (rk.length !== 32 || dhOut.length !== 32) {
      throw new Error("Invalid key lengths for kdfRK");
    }
    const okm = hkdf(rk, dhOut, INFO_RK, 64);
    return [okm.slice(0, 32), okm.slice(32, 64)];
  },

  /**
   * Derive next chain key and message key using BLAKE2b
   * @param {Uint8Array} ck - Current chain key
   * @returns {[Uint8Array, Uint8Array]} Next chain key and message key
   */
  kdfCK(ck: Uint8Array): [Uint8Array, Uint8Array] {
    if (ck.length !== 32) {
      throw new Error("Invalid chain key length");
    }
    const mk = crypto_generichash(32, CHAIN_CONSTANT_1, ck);
    const nextCK = crypto_generichash(32, CHAIN_CONSTANT_2, ck);
    return [nextCK, mk];
  },

  /**
   * Encrypt plaintext with XChaCha20-Poly1305 AEAD
   * @param {Uint8Array} mk - Message key
   * @param {string} plaintext - Data to encrypt
   * @param {Uint8Array} ad - Associated data
   * @returns {Uint8Array} nonce || ciphertext
   */
  encrypt(mk: Uint8Array, plaintext: string, ad: Uint8Array): Uint8Array {
    if (mk.length !== 32) {
      throw new Error("Invalid message key length");
    }
    const nonce = randombytes_buf(crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = crypto_aead_xchacha20poly1305_ietf_encrypt(
      encoder.encode(plaintext),
      ad,
      null,
      nonce,
      mk,
    );
    return new Uint8Array([...nonce, ...ciphertext]);
  },

  /**
   * Decrypt ciphertext with XChaCha20-Poly1305 AEAD
   * @param {Uint8Array} mk - Message key
   * @param {Uint8Array} ciphertext - nonce || ciphertext
   * @param {Uint8Array} ad - Associated data
   * @returns {string} Decrypted plaintext
   * @throws {Error} If decryption fails
   */
  decrypt(mk: Uint8Array, ciphertext: Uint8Array, ad: Uint8Array): string {
    if (
      mk.length !== 32 ||
      ciphertext.length < crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
    ) {
      throw new Error("Invalid key or ciphertext length");
    }
    const nonce = ciphertext.slice(
      0,
      crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    const encryptedData = ciphertext.slice(
      crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    const plaintext = crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      encryptedData,
      ad,
      nonce,
      mk,
    );
    return decoder.decode(plaintext);
  },

  /**
   * Create a message header
   * @param {DHKeyPair} dhPair - DH key pair
   * @param {number} pn - Previous chain length
   * @param {number} n - Message number
   * @returns {Uint8Array} 40-byte header
   */
  header(dhPair: DHKeyPair, pn: number, n: number): Uint8Array {
    const header = new Uint8Array(40);
    header.set(dhPair.publicKey, 0);
    const view = new DataView(header.buffer);
    view.setUint32(32, pn, false);
    view.setUint32(36, n, false);
    return header;
  },

  /**
   * Encrypt a message header
   * @param {Uint8Array} headerKey - Header encryption key
   * @param {Uint8Array} header - Header to encrypt
   * @returns {Uint8Array} Encrypted header
   */
  encryptHeader(headerKey: Uint8Array, header: Uint8Array): Uint8Array {
    const nonce = randombytes_buf(crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const encHeader = crypto_aead_xchacha20poly1305_ietf_encrypt(
      header,
      null,
      null,
      nonce,
      headerKey,
    );
    return this.concat(nonce, encHeader);
  },

  /**
   * Decrypt an encrypted message header
   * @param {Uint8Array} headerKey - Header encryption key
   * @param {Uint8Array} encryptedHeader - Encrypted header
   * @returns {Uint8Array} Decrypted header
   */
  decryptHeader(
    headerKey: Uint8Array,
    encryptedHeader: Uint8Array,
  ): Uint8Array {
    const nonce = encryptedHeader.slice(
      0,
      crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    const header = encryptedHeader.slice(
      crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    return crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      header,
      null,
      nonce,
      headerKey,
    );
  },

  /**
   * Derive a header encryption key
   * @param {Uint8Array} rk - Root key
   * @returns {Uint8Array} 32-byte header key
   */
  deriveHeaderKey(rk: Uint8Array): Uint8Array {
    if (rk.length !== 32) {
      throw new Error("Invalid root key length");
    }
    return hkdf(null, rk, INFO_HEADER, 32);
  },

  /**
   * Concatenate two Uint8Arrays
   * @param {Uint8Array} a - First array
   * @param {Uint8Array} b - Second array
   * @returns {Uint8Array} Concatenated array
   */
  concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  },

  /**
   * Securely wipe memory
   * @param {Uint8Array} array - Data to wipe
   */
  wipeMemory(array: Uint8Array): void {
    if (array?.length > 0) {
      memzero(array);
    }
  },
};
