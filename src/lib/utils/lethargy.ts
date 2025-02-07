import { CircularBuffer } from "../core";

export type LethargyConfig = {
  stability?: number;
  sensitivity?: number;
  tolerance?: number;
  delay?: number;
};

export class Lethargy {
  private stability: number;
  private sensitivity: number;
  private tolerance: number;
  private delay: number;
  private totalSamples: number;
  private upDeltas: CircularBuffer<number>;
  private downDeltas: CircularBuffer<number>;
  private tsBuffer: CircularBuffer<number>;

  constructor({
    stability = 8,
    sensitivity = 100,
    tolerance = 1.1,
    delay = 150,
  }: LethargyConfig = {}) {
    this.stability = stability;
    this.sensitivity = sensitivity;
    this.tolerance = tolerance;
    this.delay = delay;
    this.totalSamples = stability * 2;
    this.upDeltas = new CircularBuffer(this.totalSamples);
    this.downDeltas = new CircularBuffer(this.totalSamples);
    this.tsBuffer = new CircularBuffer(this.totalSamples);
  }

  public check(event: any): number | false {
    let lastDelta: number;
    event = event.originalEvent || event;
    if (event.wheelDelta !== undefined) {
      lastDelta = event.wheelDelta;
    } else if (event.deltaY !== undefined) {
      lastDelta = event.deltaY * -40;
    } else if (event.detail !== undefined || event.detail === 0) {
      lastDelta = event.detail * -40;
    } else {
      return false;
    }

    this.tsBuffer.put(Date.now());

    if (lastDelta > 0) {
      this.upDeltas.put(lastDelta);
      return this.isInertia(1, this.upDeltas);
    } else {
      this.downDeltas.put(lastDelta);
      return this.isInertia(-1, this.downDeltas);
    }
  }

  private isInertia(
    direction: number,
    deltaBuffer: CircularBuffer<number>,
  ): number | false {
    const orderedDeltas = deltaBuffer.getAll();

    if (orderedDeltas.length < this.totalSamples) {
      return direction;
    }

    const tsOrdered = this.tsBuffer.getAll();
    if (
      tsOrdered[tsOrdered.length - 2] + this.delay > Date.now() &&
      orderedDeltas[0] === orderedDeltas[orderedDeltas.length - 1]
    ) {
      return false;
    }

    const oldDeltas = orderedDeltas.slice(0, this.stability);
    const newDeltas = orderedDeltas.slice(this.stability, this.totalSamples);

    const oldAvg = oldDeltas.sum() / oldDeltas.length;
    const newAvg = newDeltas.sum() / newDeltas.length;

    if (
      Math.abs(oldAvg) <= Math.abs(newAvg) * this.tolerance &&
      Math.abs(newAvg) > this.sensitivity
    ) {
      return direction;
    }

    return false;
  }
}
