/**
 * Lethargy help distinguish between scroll events initiated by the user, and those by inertial scrolling.
 * Lethargy does not have external dependencies.
 *
 * @param stability - Specifies the length of the rolling average.
 * In effect, the larger the value, the smoother the curve will be.
 * This attempts to prevent anomalies from firing 'real' events. Valid values are all positive integers,
 * but in most cases, you would need to stay between 5 and around 30.
 *
 * @param sensitivity - Specifies the minimum value for wheelDelta for it to register as a valid scroll event.
 * Because the tail of the curve have low wheelDelta values,
 * this will stop them from registering as valid scroll events.
 * The unofficial standard wheelDelta is 120, so valid values are positive integers below 120.
 *
 * @param tolerance - Prevent small fluctuations from affecting results.
 * Valid values are decimals from 0, but should ideally be between 0.05 and 0.3.
 *
 */

import { WheelEvent } from 'react';

export type LethargyConfig = {
  stability?: number;
  sensitivity?: number;
  tolerance?: number;
  delay?: number;
};

export class Lethargy {
  stability: number;
  sensitivity: number;
  tolerance: number;
  delay: number;

  lastUpDelta: number = 0;
  lastDownDelta: number = 0;
  lastUpTimestamp: number = 0;
  lastDownTimestamp: number = 0;

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
  }

  check(e: WheelEvent | Event) {
    let lastDelta: number = -1;
    const event = e as WheelEvent;

    if (event.deltaY !== undefined) {
      lastDelta = event.deltaY * -40;
    } else if (event.detail !== undefined || event.detail === 0) {
      lastDelta = event.detail * -40;
    }

    const currentTime = Date.now();

    if (lastDelta > 0) {
      return this.isInertia(1, lastDelta, currentTime);
    } else {
      return this.isInertia(-1, lastDelta, currentTime);
    }
  }

  isInertia(direction: number, delta: number, currentTime: number) {
    const lastTimestamp = direction === 1 ? this.lastUpTimestamp : this.lastDownTimestamp;
    const lastDelta = direction === 1 ? this.lastUpDelta : this.lastDownDelta;

    if (currentTime - lastTimestamp < this.delay && delta === lastDelta) {
      return false;
    }

    const newAverage = delta;

    if (
      Math.abs(newAverage) <= Math.abs(lastDelta * this.tolerance) &&
      this.sensitivity < Math.abs(newAverage)
    ) {
      return true;
    }

    if (direction === 1) {
      this.lastUpDelta = delta;
      this.lastUpTimestamp = currentTime;
    } else {
      this.lastDownDelta = delta;
      this.lastDownTimestamp = currentTime;
    }

    return false;
  }
}
