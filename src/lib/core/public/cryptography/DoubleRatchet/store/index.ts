import sodium from "libsodium-wrappers";

function base64url(buf: Uint8Array): string {
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(buf)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export class SkippedKeyStore {
  private store = new Map<string, Uint8Array>();
  private readonly maxSize: number;

  constructor(maxSize = 1024) {
    this.maxSize = maxSize;
  }

  static makeKeyId(dhPubKey: Uint8Array, msgNum: number): string {
    const buf = new Uint8Array(dhPubKey.length + 4);
    buf.set(dhPubKey, 0);
    new DataView(buf.buffer).setUint32(dhPubKey.length, msgNum, false); // big-endian
    return base64url(buf);
  }

  set(dhPubKey: Uint8Array, msgNum: number, messageKey: Uint8Array): void {
    if (this.store.size >= this.maxSize) {
      throw new Error('SkippedKeyStore is full');
    }
    const id = SkippedKeyStore.makeKeyId(dhPubKey, msgNum);
    this.store.set(id, messageKey);
  }

  take(dhPubKey: Uint8Array, msgNum: number): Uint8Array | undefined {
    const id = SkippedKeyStore.makeKeyId(dhPubKey, msgNum);
    const key = this.store.get(id);

    if (key) {
      this.store.delete(id);
      sodium.memzero(key);
      return key;
    }

    return undefined;
  }

  clear(): void {
    this.store.forEach(sodium.memzero);
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  has(dhPubKey: Uint8Array, msgNum: number): boolean {
    const id = SkippedKeyStore.makeKeyId(dhPubKey, msgNum);
    return this.store.has(id);
  }
}

