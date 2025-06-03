let serverTimeOffset = 0;

/**
 * Sets the server time offset.
 * The offset represents the difference between client and server time (in seconds).
 */
export function setServerTimeOffset(offset: number): void {
  serverTimeOffset = offset;
}

/**
 * Retrieves the current server time offset.
 */
export function getServerTimeOffset(): number {
  return serverTimeOffset;
}

/**
 * Gets the current server time, accounting for any time offset.
 * @returns The server time in seconds (since epoch).
 */
export function getServerTime(): number {
  return Math.floor(Date.now() / 1000) + serverTimeOffset;
}
