/**
 * Optimized MurmurHash2 implementation based on MurmurHashNeutral2
 * @param key - Input string to hash
 * @param seed - Seed value for hash (default 0)
 * @returns 32-bit unsigned integer hash
 */
export function murmurHash2(key: string, seed: number = 0): number {
  const m = 0x5bd1e995;
  const r = 24;

  const buffer = Buffer.from(key, 'utf-8'); // Convert string to UTF-8 byte array
  const len = buffer.length;
  let h = (seed ^ len) >>> 0; // Initialize with seed XOR length, ensure 32-bit

  let index = 0;

  while (index <= len - 4) {
    let k = (buffer[index] |
      (buffer[index + 1] << 8) |
      (buffer[index + 2] << 16) |
      (buffer[index + 3] << 24)) >>> 0; // Combine bytes, ensure 32-bit

    k = (k * m) >>> 0; // Multiply and wrap to 32-bit
    k ^= k >>> r; // Right shift and XOR
    k = (k * m) >>> 0; // Multiply again

    h = (h * m) >>> 0; // Multiply h
    h ^= k; // XOR with k
    index += 4;
  }

  const remaining = len - index;
  if (remaining >= 1) {
    h ^= buffer[index];
    if (remaining >= 2) {
      h ^= buffer[index + 1] << 8;
      if (remaining >= 3) {
        h ^= buffer[index + 2] << 16;
      }
    }
    h = (h * m) >>> 0;
  }

  h ^= h >>> 13;
  h = (h * m) >>> 0;
  h ^= h >>> 15;

  return h >>> 0;
}
