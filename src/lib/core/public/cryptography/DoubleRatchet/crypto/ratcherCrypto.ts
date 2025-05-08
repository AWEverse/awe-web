import sodium from "libsodium-wrappers";
import { DHKeyPair } from "..";
import hkdf from "./hkdf";
import { INFO_RK, INFO_HEADER, CHAIN_CONSTANT_1, CHAIN_CONSTANT_2 } from "../config";

/**
 * Cryptographic operations for the Double Ratchet Protocol
 * Using libsodium for all primitive operations
 */
export default {
  /**
   * Generate a new X25519 DH key pair using libsodium's secure RNG
   */
  generateDH(): DHKeyPair {
    // Use X25519 for best security/performance
    const keypair = sodium.crypto_box_keypair();
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
    };
  },

  /**
   * Perform X25519 Diffie-Hellman key agreement
   * Returns 32-byte shared secret
   */
  dh(dhPair: DHKeyPair, publicKey: Uint8Array): Uint8Array {
    try {
      // Constant-time implementation from libsodium
      const sharedSecret = sodium.crypto_scalarmult(dhPair.privateKey, publicKey);

      // Validate shared secret is not all zeros (invalid public key)
      let isZero = true;
      for (let i = 0; i < sharedSecret.length; i++) {
        isZero = isZero && sharedSecret[i] === 0;
      }
      if (isZero) {
        throw new Error("Invalid public key - shared secret is zero");
      }

      return sharedSecret;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`DH operation failed: ${e.message}`);
      }
      throw new Error("DH operation failed: Unknown error");
    }
  },

  /**
   * Root Key derivation function using HKDF
   * Returns [32-byte root key, 32-byte chain key]
   */
  kdfRK(rk: Uint8Array, dhOut: Uint8Array): [Uint8Array, Uint8Array] {
    // Generate 64 bytes (32 for RK and 32 for CK) using HKDF
    const okm = hkdf(rk, dhOut, INFO_RK, 64);

    return [
      okm.slice(0, 32), // New Root Key
      okm.slice(32, 64), // Chain Key
    ];
  },

  /**
   * Chain Key derivation function using BLAKE2b
   * More efficient than HMAC-based KDF for this purpose
   * Returns [32-byte next chain key, 32-byte message key]
   */
  kdfCK(ck: Uint8Array): [Uint8Array, Uint8Array] {
    // Use BLAKE2b with different constants for domain separation
    const mk = sodium.crypto_generichash(32, CHAIN_CONSTANT_1, ck);
    const nextCK = sodium.crypto_generichash(32, CHAIN_CONSTANT_2, ck);
    return [nextCK, mk];
  },

  /**
   * Encrypts plaintext with XChaCha20-Poly1305 AEAD
   * Provides 192-bit security and defense against nonce reuse
   */
  encrypt(mk: Uint8Array, plaintext: string, ad: Uint8Array): Uint8Array {
    // Generate 192-bit nonce for XChaCha20
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    // Encrypt with associated data for authenticity
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      new TextEncoder().encode(plaintext),
      ad,
      null, // No additional secret data
      nonce,
      mk
    );

    // Return nonce || ciphertext
    return new Uint8Array([...nonce, ...ciphertext]);
  },

  /**
   * Decrypts ciphertext with XChaCha20-Poly1305 AEAD
   * Verifies authenticity using Poly1305 MAC
   */
  decrypt(mk: Uint8Array, ciphertext: Uint8Array, ad: Uint8Array): string {
    // Split nonce and ciphertext
    const nonce = ciphertext.slice(0, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const encryptedData = ciphertext.slice(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    try {
      // Decrypt and verify MAC
      const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
        null,
        encryptedData,
        ad,
        nonce,
        mk
      );
      return new TextDecoder().decode(plaintext);
    } catch (e) {
      throw new Error("Decryption failed: Authentication check failed");
    }
  },

  /**
   * Create a Double Ratchet message header
   * Format: pubkey (32) || prevChainLen (4) || msgNum (4)
   */
  header(dhPair: DHKeyPair, pn: number, n: number): Uint8Array {
    const header = new Uint8Array(40);

    // Copy public key
    header.set(dhPair.publicKey, 0);

    // Write chain lengths as big-endian uint32
    const view = new DataView(header.buffer);
    view.setUint32(32, pn, false); // Previous chain length
    view.setUint32(36, n, false); // Message number

    return header;
  },

  /**
   * Encrypts a message header to protect metadata
   */
  encryptHeader(headerKey: Uint8Array, header: Uint8Array): Uint8Array {
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const encHeader = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      header,
      null,
      null,
      nonce,
      headerKey
    );
    return this.concat(nonce, encHeader);
  },

  /**
   * Decrypts an encrypted message header
   */
  decryptHeader(headerKey: Uint8Array, encryptedHeader: Uint8Array): Uint8Array {
    const nonce = encryptedHeader.slice(0, sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);
    const header = encryptedHeader.slice(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES);

    return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null,
      header,
      null,
      nonce,
      headerKey
    );
  },

  /**
   * Derives a header encryption key from the root key
   */
  deriveHeaderKey(rk: Uint8Array): Uint8Array {
    return hkdf(null, rk, INFO_HEADER, 32);
  },

  /**
   * Concatenate Uint8Arrays efficiently using a single allocation
   */
  concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  },

  /**
   * Securely wipe sensitive data from memory
   * Uses libsodium's secure memory wiping function
   */
  wipeMemory(array: Uint8Array): void {
    if (array && array.length > 0) {
      try {
        sodium.memzero(array);
      } catch (e) {
        // Fallback if sodium.memzero fails
        array.fill(0);
        // Additional passes with random data
        for (let i = 0; i < 3; i++) {
          array.set(sodium.randombytes_buf(array.length));
        }
        array.fill(0);
      }
    }
  },
};



