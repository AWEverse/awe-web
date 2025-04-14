export const HASH_LEN = 32;            // Size of SHA-256 output (HKDF и др.)
export const MAX_SKIP = 1024;

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

export const CHAIN_CONSTANT_1 = new Uint8Array([0x02]);
export const CHAIN_CONSTANT_2 = new Uint8Array([0x04]);
export const CHAIN_CONSTANT_3 = new Uint8Array([0x08]);
