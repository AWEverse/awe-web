/**
 * Curve448/X448 implementation according to RFC 7748
 * https://datatracker.ietf.org/doc/html/rfc7748
 */

type FE = Uint8Array; // Field Element: 56-byte little-endian integer mod p

// Prime p = 2^448 - 2^224 - 1
const P = new Uint8Array([
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff,
]);

// Constant (A + 2)/4 for Curve448
const A24 = 39082;

/**
 * Decode scalar (little-endian, clamp later)
 */
function decodeScalar(b: Uint8Array): Uint8Array {
  const result = new Uint8Array(b);
  result[55] &= 0x7f; // Mask highest bit
  return result;
}

/**
 * Clamp a scalar per RFC 7748:
 * - Clear bottom 2 bits of first byte
 * - Set bit 447, clear bit 446, set bit 445
 */
function clampScalar(s: Uint8Array): Uint8Array {
  const result = new Uint8Array(s);
  result[0] &= 0xfc; // Clear bottom 2 bits
  result[55] |= 0x80; // Set bit 447
  result[55] &= 0xfd; // Clear bit 446
  result[55] |= 0x40; // Set bit 445
  return result;
}

/**
 * Encode field element as 56-byte little-endian
 */
function encodeUCoordinate(u: Uint8Array): Uint8Array {
  return new Uint8Array(u);
}

/**
 * Add two field elements modulo p
 * Simplified version (not constant-time or fully reduced)
 */
function feAdd(a: FE, b: FE): FE {
  const out = new Uint8Array(56);
  let carry = 0;
  for (let i = 0; i < 56; i++) {
    const sum = a[i] + b[i] + carry;
    out[i] = sum & 0xff;
    carry = sum >>> 8;
  }
  return reduce(out); // Apply modular reduction
}

/**
 * Subtract two field elements modulo p
 */
function feSub(a: FE, b: FE): FE {
  const out = new Uint8Array(56);
  let borrow = 0;
  for (let i = 0; i < 56; i++) {
    const diff = a[i] - b[i] - borrow;
    out[i] = diff & 0xff;
    borrow = diff < 0 ? 1 : 0;
  }
  if (borrow) {
    return feAdd(out, P);
  }
  return out;
}

/**
 * Multiply two field elements modulo p
 */
function feMul(a: FE, b: FE): FE {
  const out = new Uint8Array(112);
  for (let i = 0; i < 56; i++) {
    let carry = 0;
    for (let j = 0; j < 56; j++) {
      const idx = i + j;
      const t = out[idx] + a[i] * b[j] + carry;
      out[idx] = t & 0xff;
      carry = t >>> 8;
    }
    out[i + 56] = carry;
  }
  return reduce(out.slice(0, 56));
}

/**
 * Square a field element
 */
function feSquare(a: FE): FE {
  return feMul(a, a);
}

/**
 * Compute multiplicative inverse using Fermat’s Little Theorem
 */
function feInvert(a: FE): FE {
  // a^(p-2) mod p
  let result: FE = new Uint8Array(56);
  result[0] = 1;

  let exponent =
    BigInt(
      "0x" +
      [...P]
        .reverse()
        .map((x) => x.toString(16).padStart(2, "0"))
        .join(""),
    ) - 2n;
  let base: FE = new Uint8Array(a);

  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = feMul(result, base);
    }
    base = feSquare(base);
    exponent = exponent >> 1n;
  }

  return result;
}

/**
 * Conditional swap (constant-time)
 */
function cswap(swap: number, a: FE, b: FE): [FE, FE] {
  const mask = -swap & 0xff;
  const r1 = new Uint8Array(56);
  const r2 = new Uint8Array(56);
  for (let i = 0; i < 56; i++) {
    const t = mask & (a[i] ^ b[i]);
    r1[i] = a[i] ^ t;
    r2[i] = b[i] ^ t;
  }
  return [r1, r2];
}

/**
 * Reduce a 56-byte buffer modulo P
 */
function reduce(x: FE): FE {
  let carry = 0;
  const tmp = new Uint8Array(56);
  for (let i = 0; i < 56; i++) {
    const v = x[i] + carry;
    tmp[i] = v & 0xff;
    carry = v >> 8;
  }

  if (carry > 0) {
    let borrow = 0;
    for (let i = 0; i < 56; i++) {
      const v = tmp[i] - P[i] - borrow;
      tmp[i] = v & 0xff;
      borrow = v < 0 ? 1 : 0;
    }
    if (borrow) return tmp;
    return tmp;
  }

  // If tmp >= P, subtract P
  for (let i = 55; i >= 0; i--) {
    if (tmp[i] > P[i]) break;
    if (tmp[i] < P[i]) return tmp;
  }

  let borrow = 0;
  for (let i = 0; i < 56; i++) {
    const v = tmp[i] - P[i] - borrow;
    tmp[i] = v & 0xff;
    borrow = v < 0 ? 1 : 0;
  }

  return tmp;
}

/**
 * X448 scalar multiplication: k·u
 */
function x448(k: FE, u: FE): FE {
  const scalar = clampScalar(decodeScalar(k));
  let x1: FE = new Uint8Array(u);
  let x2: FE = new Uint8Array(56);
  x2[0] = 1;
  let z2: FE = new Uint8Array(56);
  let x3: FE = new Uint8Array(u);
  let z3: FE = new Uint8Array(56);
  z3[0] = 1;

  let swap = 0;

  for (let t = 447; t >= 0; t--) {
    const byteIndex = Math.floor(t / 8);
    const bitIndex = t % 8;
    const bit = (scalar[byteIndex] >> bitIndex) & 1;

    swap ^= bit;
    [x2, x3] = cswap(swap, x2, x3);
    [z2, z3] = cswap(swap, z2, z3);
    swap = bit;

    const A = feAdd(x2, z2);
    const AA = feSquare(A);
    const B = feSub(x2, z2);
    const BB = feSquare(B);
    const E = feSub(AA, BB);
    const C = feAdd(x3, z3);
    const D = feSub(x3, z3);
    const DA = feMul(D, A);
    const CB = feMul(C, B);

    x3 = feSquare(feAdd(DA, CB));
    z3 = feMul(x1, feSquare(feSub(DA, CB)));
    x2 = feMul(AA, BB);
    z2 = feMul(E, feAdd(AA, feMul(E, new Uint8Array([A24]))));
  }

  [x2, x3] = cswap(swap, x2, x3);
  [z2, z3] = cswap(swap, z2, z3);

  const invZ2 = feInvert(z2);
  const result = feMul(x2, invZ2);
  return encodeUCoordinate(result);
}

export default class Curve448 {
  /**
   * Generate a random seed
   */
  static generateSeed(length = 56): Uint8Array {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr); // Assumes browser environment
    return arr;
  }

  /**
   * Generate key pair
   */
  static generateKeyPair(): { publicKey: Uint8Array; privateKey: Uint8Array } {
    const privateKey = this.generateSeed(56);
    const basePoint = new Uint8Array(56);
    basePoint[0] = 5; // u = 5
    const publicKey = x448(privateKey, basePoint);
    return { publicKey, privateKey };
  }

  /**
   * Scalar multiplication: k·u
   */
  static scalarMult(k: Uint8Array, u: Uint8Array): Uint8Array {
    const result = x448(k, u);

    // Check for all-zero output (invalid point)
    let isZero = true;
    for (const byte of result) {
      if (byte !== 0) {
        isZero = false;
        break;
      }
    }

    if (isZero) {
      throw new Error("Invalid shared secret - point has small order");
    }

    return result;
  }
}
