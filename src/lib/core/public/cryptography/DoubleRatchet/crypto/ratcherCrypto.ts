import sodium from "libsodium-wrappers";
import { DHKeyPair } from "..";
import hkdf from "./hkdf";
import { INFO_RK, CHAIN_CONSTANT_1, CHAIN_CONSTANT_2 } from "../config";

/**
 * Crypto operations needed for Double Ratchet
 */
export default {
  /**
   * Generate a new DH key pair
   */
  generateDH(): DHKeyPair {
    const keypair = sodium.crypto_box_keypair();
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
    };
  },

  /**
   * Perform Diffie-Hellman key agreement
   */
  dh(dhPair: DHKeyPair, publicKey: Uint8Array): Uint8Array {
    try {
      return sodium.crypto_scalarmult(dhPair.privateKey, publicKey);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`DH operation failed: ${e.message}`);
      }
      throw new Error("DH operation failed: Unknown error");
    }
  },

  /**
   * Root Key derivation function
   */
  kdfRK(rk: Uint8Array, dhOut: Uint8Array): [Uint8Array, Uint8Array] {
    // Generate 64 bytes (32 for RK and 32 for CK)
    const okm = hkdf(rk, dhOut, INFO_RK, 64);

    return [
      okm.slice(0, 32), // New Root Key
      okm.slice(32, 64), // Chain Key
    ];
  },

  /**
   * Chain Key derivation function - more efficient implementation
   */
  kdfCK(ck: Uint8Array): [Uint8Array, Uint8Array] {
    const mk = sodium.crypto_generichash(32, CHAIN_CONSTANT_1, ck);
    const nextCK = sodium.crypto_generichash(32, CHAIN_CONSTANT_2, ck);
    return [nextCK, mk];
  },

  /**
   * Encrypts plaintext with authenticated encryption
   */
  encrypt(mk: Uint8Array, plaintext: string, ad: Uint8Array): Uint8Array {
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      new TextEncoder().encode(plaintext),
      ad,
      null,
      nonce,
      mk
    );
    return new Uint8Array([...nonce, ...ciphertext]);
  },

  /**
   * Decrypts ciphertext with authenticated encryption
   */
  decrypt(mk: Uint8Array, ciphertext: Uint8Array, ad: Uint8Array): string {
    const nonce = ciphertext.slice(0, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const data = ciphertext.slice(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      data,
      ad,
      nonce,
      mk
    );
    return new TextDecoder().decode(plaintext);
  },

  /**
   * Create a message header using bit operations
   */
  header(dhPair: DHKeyPair, pn: number, n: number): Uint8Array {
    const header = new Uint8Array(40); // 32 (public key) + 4 (PN) + 4 (N)
    header.set(dhPair.publicKey, 0);

    const view = new DataView(header.buffer);
    view.setUint32(32, pn, false); // PN, big-endian
    view.setUint32(36, n, false);  // N, big-endian

    return header;
  },

  /**
   * Concatenate two Uint8Arrays efficiently
   */
  concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  },

  /**
   * Secure memzero for sensitive data
   */
  wipeMemory(array: Uint8Array): void {
    if (array && array.length > 0) {
      sodium.memzero(array);
    }
  },
};



