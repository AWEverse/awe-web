import sodium from "libsodium-wrappers";
import { DHKeyPair } from "../types";
import hkdf from "./hkdf";
import { INFO_RK, CHAIN_CONSTANT_1, CHAIN_CONSTANT_2 } from "../config";

export default {
  // Generate DH key pair (Curve25519)
  generateDH(): DHKeyPair {
    return sodium.crypto_box_keypair();
  },

  // Diffie-Hellman key agreement (X25519)
  dh(dhPair: DHKeyPair, publicKey: Uint8Array): Uint8Array {
    return sodium.crypto_scalarmult(dhPair.privateKey, publicKey);
  },

  // Root Key derivation (HKDF with SHA-256)
  kdfRK(rk: Uint8Array, dhOut: Uint8Array): [Uint8Array, Uint8Array] {
    const okm = hkdf(rk, dhOut, INFO_RK, 64);
    return [okm.subarray(0, 32), okm.subarray(32, 64)];
  },

  // Chain Key derivation (HMAC-SHA-256)
  kdfCK(ck: Uint8Array): [Uint8Array, Uint8Array] {
    return [
      sodium.crypto_generichash(32, CHAIN_CONSTANT_2, ck),
      sodium.crypto_generichash(32, CHAIN_CONSTANT_1, ck)
    ];
  },

  // AEAD encryption (XChaCha20-Poly1305)
  encrypt(mk: Uint8Array, plaintext: string, ad: Uint8Array): Uint8Array {
    const nonce = sodium.randombytes_buf(24);
    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      new TextEncoder().encode(plaintext),
      ad, null, nonce, mk
    );
    return Uint8Array.of(...nonce, ...ciphertext);
  },

  // AEAD decryption (XChaCha20-Poly1305)
  decrypt(mk: Uint8Array, ciphertext: Uint8Array, ad: Uint8Array): string {
    const nonce = ciphertext.subarray(0, 24);
    const data = ciphertext.subarray(24);
    return new TextDecoder().decode(
      sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(null, data, ad, nonce, mk)
    );
  },

  // Message header creation
  header(dhPair: DHKeyPair, pn: number, n: number): Uint8Array {
    const header = new Uint8Array(40);
    header.set(dhPair.publicKey);
    new DataView(header.buffer).setUint32(32, pn);
    new DataView(header.buffer).setUint32(36, n);
    return header;
  },

  // Efficient array concatenation
  concat(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
  },

  // Secure memory wipe
  wipeMemory(array: Uint8Array): void {
    array && sodium.memzero(array);
  }
};
