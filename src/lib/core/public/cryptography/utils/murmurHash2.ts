export default function murmurHash2(key: string, len: number): number {
  const m = 0x5bd1e995;
  const seed = 0;
  const r = 24;

  let h = seed ^ len;

  const buffer = Buffer.from(key, 'utf-8');
  let index = 0;

  while (index <= len - 4) {
    let k = buffer[index++] |
      (buffer[index++] << 8) |
      (buffer[index++] << 16) |
      (buffer[index++] << 24);

    k *= m;
    k ^= k >>> r;
    k *= m;

    h *= m;
    h ^= k;
  }

  switch (len - index) {
    case 3:
      h ^= buffer[index + 2] << 16;
      break;
    case 2:
      h ^= buffer[index + 1] << 8;
      break;
    case 1:
      h ^= buffer[index];
      h *= m;
      break;
  }

  h ^= h >>> 13;
  h *= m;
  h ^= h >>> 15;

  return h >>> 0; // Ensure unsigned 32-bit result
}
