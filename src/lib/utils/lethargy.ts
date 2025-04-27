import { CircularBuffer, average } from "../core";

// Configuration for inertia detection
export type LethargyConfig = {
  stability?: number; // Number of samples for stable phase
  sensitivity?: number; // Minimum delta threshold for inertia
  tolerance?: number; // Ratio for comparing old vs. new deltas
  delay?: number; // Time window for delta consistency check (ms)
};

export class Lethargy {
  private readonly stability: number;
  private readonly sensitivity: number;
  private readonly tolerance: number;
  private readonly delay: number;
  private readonly totalSamples: number;
  private readonly upDeltas: CircularBuffer<number>;
  private readonly downDeltas: CircularBuffer<number>;
  private readonly tsBuffer: CircularBuffer<number>;

  constructor({
    stability = 8,
    sensitivity = 100,
    tolerance = 1.1,
    delay = 150,
  }: LethargyConfig = {}) {
    if (stability < 1 || sensitivity < 0 || tolerance < 1 || delay < 0) {
      throw new Error("Invalid configuration parameters");
    }
    this.stability = stability;
    this.sensitivity = sensitivity;
    this.tolerance = tolerance;
    this.delay = delay;
    this.totalSamples = stability * 2;
    this.upDeltas = new CircularBuffer(this.totalSamples);
    this.downDeltas = new CircularBuffer(this.totalSamples);
    this.tsBuffer = new CircularBuffer(this.totalSamples);
  }

  /**
   * Determines if the scroll event indicates inertia based on wheel delta analysis.
   * @param event - The wheel event (with originalEvent fallback).
   * @returns Direction (1 for up, -1 for down) if inertia detected, false otherwise.
   */
  public check(event: any): number | false {
    const e = event.originalEvent || event;
    let delta: number;

    if (e.wheelDelta !== undefined) {
      delta = e.wheelDelta;
    } else if (e.deltaY !== undefined) {
      delta = e.deltaY * -40; // Normalize to wheelDelta scale
    } else if (e.detail !== undefined) {
      delta = e.detail * -40; // Normalize to wheelDelta scale
    } else {
      return false;
    }

    this.tsBuffer.write(Date.now());
    const direction = delta > 0 ? 1 : -1;
    const buffer = delta > 0 ? this.upDeltas : this.downDeltas;
    buffer.write(Math.abs(delta));

    return this.isInertia(direction, buffer);
  }

  /**
   * Analyzes delta buffer to detect scroll inertia using statistical comparison.
   * @param direction - Scroll direction (1 for up, -1 for down).
   * @param deltaBuffer - Circular buffer of scroll deltas.
   * @returns Direction if inertia detected, false otherwise.
   */
  private isInertia(direction: number, deltaBuffer: CircularBuffer<number>): number | false {
    if (!deltaBuffer.isFull()) return direction; // Early return for insufficient samples

    const deltas = deltaBuffer.readAll();
    const timestamps = this.tsBuffer.readAll();

    // Check if recent events are within delay and deltas are stagnant
    const lastTs = timestamps[timestamps.length - 2];
    if (
      lastTs + this.delay > Date.now() &&
      deltas[0] === deltas[deltas.length - 1]
    ) {
      return false;
    }

    // Split deltas into stable and recent phases
    const stableDeltas = deltas.slice(0, this.stability);
    const recentDeltas = deltas.slice(this.stability);

    // Compute averages for stable and recent phases
    const stableAvg = average(stableDeltas);
    const recentAvg = average(recentDeltas);

    // Inertia condition: recent phase has significantly higher magnitude
    // and exceeds sensitivity threshold
    return Math.abs(stableAvg) <= Math.abs(recentAvg) * this.tolerance &&
      Math.abs(recentAvg) > this.sensitivity
      ? direction
      : false;
  }
}
