export default function isZeroed(bytes: Uint8Array): boolean {
  return bytes.every((byte) => byte === 0);
}
