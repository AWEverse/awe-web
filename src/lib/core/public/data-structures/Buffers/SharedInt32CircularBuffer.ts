export default class SharedInt32CircularBuffer {
  private buffer: Int32Array;
  private readonly writePtr = new Int32Array(new SharedArrayBuffer(4));
  private readonly readPtr = new Int32Array(new SharedArrayBuffer(4));

  constructor(private readonly capacity: number) {
    if (capacity < 1) throw new Error("Capacity must be > 0");
    const sab = new SharedArrayBuffer(capacity * Int32Array.BYTES_PER_ELEMENT);
    this.buffer = new Int32Array(sab);
  }

  public write(value: number): void {
    const w = Atomics.load(this.writePtr, 0);
    const r = Atomics.load(this.readPtr, 0);
    if ((w + 1) % this.capacity === r) return; // full

    this.buffer[w] = value;
    Atomics.store(this.writePtr, 0, (w + 1) % this.capacity);
  }

  public read(): number | null {
    const w = Atomics.load(this.writePtr, 0);
    const r = Atomics.load(this.readPtr, 0);
    if (w === r) return null; // empty

    const value = this.buffer[r];
    Atomics.store(this.readPtr, 0, (r + 1) % this.capacity);
    return value;
  }

  public getBuffer() {
    return this.buffer.buffer;
  }
}
