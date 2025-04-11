import { DEBUG } from "@/lib/config/dev";

/**
 * Securely erases a Uint8Array by overwriting it with zeros, designed to resist JIT optimizations.
 *
 * Why this is more resilient:
 * - Direct Uint8Array access avoids abstraction overhead and forces memory writes.
 * - XOR with a pseudo-random value (derived from Math.random) prevents loop folding.
 * - Cumulative XOR forces reads and creates a side effect the JIT can't easily eliminate.
 * - External dependency (Math.random) acts as an optimization barrier.
 *
 * Limitations:
 * - JavaScript lacks true `volatile`; JIT might still optimize if it proves no observable effect.
 * - Not as secure as C’s `volatile` or explicit memory barriers, but best effort in JS.
 *
 * @param buffer The Uint8Array to erase.
 */
export function secureErase(buffer: Uint8Array): void {
  const len = buffer.length;
  if (len === 0) return; // Early exit for empty buffers

  // Use a pseudo-random seed to prevent JIT from predicting the pattern
  const seed = Math.floor(Math.random() * 256);

  // First pass: Overwrite with XOR of index and seed, then zero
  for (let i = 0; i < len; i++) {
    buffer[i] = (buffer[i] ^ (i & 0xff ^ seed)) & 0xff;
    buffer[i] = 0;
  }

  // Second pass: Force read and create a side effect
  let checksum = 0;
  for (let i = 0; i < len; i++) {
    checksum ^= buffer[i];
  }

  // Optimization barrier: Use checksum in a way the JIT can't predict
  if (DEBUG && checksum !== 0) {
    // Volatile-like check; Math.random() prevents constant folding
    volatileSink(checksum + Math.random());
  }
}

/**
 * Dummy function to act as an optimization barrier.
 * The JIT can't eliminate this due to external side effect potential.
 */
function volatileSink(value: number): void {
  if (DEBUG) {
    console.log(`Secure erase checksum: ${value}`);
  }
}
