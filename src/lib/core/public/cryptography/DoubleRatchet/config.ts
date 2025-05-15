/**
 * Double Ratchet Protocol Configuration
 * Implementation based on Signal Protocol specification v4.0
 */

export const PROTOCOL_VERSION = '1.0.0';
export const HASH_LEN = 32;            // Size of SHA-256 output
export const MAX_SKIP = 1024;          // Maximum number of message keys that can be skipped
export const MAX_CHAIN_LEN = 100;      // Maximum messages in a single chain before forcing a new ratchet
export const MAX_OLD_KEYS_AGE = 7 * 24 * 60 * 60 * 1000; // Maximum age of skipped message keys (7 days)

// Key derivation info strings
export const INFO_RK = new Uint8Array([
  0x44, // D
  0x6f, // o
  0x75, // u
  0x62, // b
  0x6c, // l
  0x65, // e
  0x52, // R
  0x61, // a
  0x74, // t
  0x63, // c
  0x68, // h
  0x65, // e
  0x74, // t
  0x52, // R
  0x4b  // K
]);

// Chain key derivation constants for domain separation
export const CHAIN_CONSTANT_1 = new Uint8Array([0x02]); // Message key derivation
export const CHAIN_CONSTANT_2 = new Uint8Array([0x04]); // Next chain key derivation
export const CHAIN_CONSTANT_3 = new Uint8Array([0x08]); // Reserved for future use

// Header encryption key info
export const INFO_HEADER = new Uint8Array([
  0x44, 0x52, 0x48, 0x45, 0x41, 0x44, 0x45, 0x52 // "DRHEADER"
]);
