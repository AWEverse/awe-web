const bufferCache = new Map<string, ArrayBuffer>();
const sizeCache = new Map<string, number>();
const pendingRequests = new Map<string, Promise<ArrayBuffer>>();

const MB = 1024 * 1024;
const DEFAULT_PART_SIZE = 0.25 * MB;
const MAX_END_TO_CACHE = 5 * MB - 1;

export async function* makeProgressiveLoader(
  url: string,
  chunkSize = DEFAULT_PART_SIZE,
): AsyncGenerator<ArrayBuffer, void, undefined> {
  // Try to get file size from URL parameters or cache
  const match = url.match(/fileSize=(\d+)/);
  let fileSize = match ? Number(match[1]) : sizeCache.get(url);
  let start = 0;

  while (true) {
    if (fileSize && start >= fileSize) return;

    const end = fileSize
      ? Math.min(start + chunkSize - 1, fileSize - 1)
      : start + chunkSize - 1;
    const cacheKey = `${url}:${start}-${end}`;

    // Check cache first
    let arrayBuffer = bufferCache.get(cacheKey);
    if (arrayBuffer) {
      yield arrayBuffer;
      start = end + 1;
      continue;
    }

    // Handle concurrent requests for same chunk
    let request = pendingRequests.get(cacheKey);
    if (!request) {
      request = fetch(url, {
        headers: { Range: `bytes=${start}-${end}` },
      }).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Update file size from Content-Range header if needed
        const contentRange = response.headers.get("Content-Range");
        if (contentRange && !fileSize) {
          const [, total] = contentRange.split("/");
          if (total && total !== "*") {
            fileSize = parseInt(total, 10);
            sizeCache.set(url, fileSize);
          }
        }

        const buffer = await response.arrayBuffer();

        // If we received less data than requested, update file size
        if (!fileSize && buffer.byteLength < chunkSize) {
          fileSize = start + buffer.byteLength;
          sizeCache.set(url, fileSize);
        }

        // Cache if within limit
        if (end <= MAX_END_TO_CACHE) {
          bufferCache.set(cacheKey, buffer);
        }

        return buffer;
      });

      pendingRequests.set(cacheKey, request);
    }

    try {
      arrayBuffer = await request;
      yield arrayBuffer;
      start = end + 1;

      // Stop if we received less data than requested
      if (!fileSize && arrayBuffer.byteLength < chunkSize) {
        fileSize = start + arrayBuffer.byteLength;
        sizeCache.set(url, fileSize);
        return;
      }
    } catch (error) {
      throw new Error(`Failed to fetch chunk ${start}-${end}: ${error}`);
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }
}
