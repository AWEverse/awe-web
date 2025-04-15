/** Concatenates multiple Uint8Arrays in a fast and safe manner. */
export function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);

  let ptr = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    result.set(chunk, ptr);
    ptr += chunk.length;
  }

  return result;
}
