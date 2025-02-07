export interface IBufferedRange {
  start: number;
  end: number;
}

// Firefox may leave <1e-4s = 0.0001s of data in buffer after clearing all content
export const MIN_ALLOWED_DURATION_ANOMALY = 1e-4;

// Some video emojis have weird duration of 0.04 causing an extreme amount of events
export const MIN_ALLOWED_MEDIA_DURATION = 0.1;

/**
 * @summary A utility class for working with `TimeRanges` objects, which represent buffered ranges of media data.
 */
export default class BTimeRanges {
  /**
   * Checks whether the buffer is small enough to be considered negligible.
   *
   * @param {TimeRanges} b - The buffer ranges to check.
   * @returns {boolean} `true` if the buffer is negligible, otherwise `false`.
   * @private
   */
  private static _isBufferNegligible(b: TimeRanges): boolean {
    // Workaround for Safari bug: https://bit.ly/2trx6O8
    return (
      b.length === 1 && b.end(0) - b.start(0) < MIN_ALLOWED_DURATION_ANOMALY
    );
  }

  /**
   * Retrieves the start time of the first buffered range.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @returns {?number} The start time of the first buffered range in seconds, or `null` if the buffer is empty or negligible.
   */
  public static bufferStart(b: TimeRanges | null): number | null {
    if (!b) {
      return null;
    }

    if (this._isBufferNegligible(b)) {
      return null;
    }

    // Workaround for Edge bug: https://bit.ly/2JYLPeB
    if (b.length === 1 && b.start(0) < 0) {
      return 0;
    }

    return b.length ? b.start(0) : null;
  }

  /**
   * Retrieves the end time of the last buffered range.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @returns {?number} The end time of the last buffered range in seconds, or `null` if the buffer is empty or negligible.
   */
  public static bufferEnd(b: TimeRanges | null): number | null {
    if (!b) {
      return null;
    }

    if (this._isBufferNegligible(b)) {
      return null;
    }

    return b.length ? b.end(b.length - 1) : null;
  }

  /**
   * Checks if a given time is inside any of the buffered ranges.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @param {number} time - The time to check.
   * @returns {boolean} `true` if the time is within a buffered range, otherwise `false`.
   */
  public static isBuffered(b: TimeRanges | null, time: number): boolean {
    if (!b || !b.length) {
      return false;
    }

    if (this._isBufferNegligible(b)) {
      return false;
    }

    if (time > b.end(b.length - 1)) {
      return false;
    }

    return time >= b.start(0);
  }

  /**
   * Computes how much content is buffered ahead of the given time, ignoring gaps between ranges.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @param {number} time - The reference time in seconds.
   * @returns {number} The amount of buffered content ahead of the given time, in seconds.
   */
  public static bufferedAheadOf(b: TimeRanges | null, time: number): number {
    if (!b || !b.length) {
      return 0;
    }

    if (this._isBufferNegligible(b)) {
      return 0;
    }

    const ranges = this.getBufferedInfo(b);

    // for (const { start, end } of ranges) {
    //   if (time < end) {
    //     result += end - Math.max(start, time);
    //   }
    // }

    return ranges.sum(({ start, end }) =>
      time < end ? end - Math.max(start, time) : 0,
    );
  }
  /**
   * Determines if the given time is inside a gap between buffered ranges.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @param {number} time - The time to check, in seconds.
   * @param {number} threshold - The gap threshold in seconds.
   * @returns {?number} The index of the buffer after the gap, or `null` if not in a gap.
   */
  public static getGapIndex(
    b: TimeRanges | null,
    time: number,
    threshold: number,
  ): number | null {
    // Return null if there are no ranges or the buffer is negligible.
    if (!b || b.length === 0 || this._isBufferNegligible(b)) {
      return null;
    }

    // Convert TimeRanges to a sorted array of buffered range objects.
    const ranges = this.getBufferedInfo(b);

    // Use binary search to find the first range with start > time.
    let low = 0;
    let high = ranges.length - 1;
    let candidate = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (ranges[mid].start > time) {
        candidate = mid;
        high = mid - 1; // Look further left for the first occurrence.
      } else {
        low = mid + 1;
      }
    }

    // If no candidate is found, return null.
    if (candidate === -1) {
      return null;
    }

    // Check if the gap condition is satisfied:
    // Either this is the first range, or the gap from the previous range's end to the time is within threshold.
    if (candidate === 0 || ranges[candidate - 1].end - time <= threshold) {
      return candidate;
    }

    return null;
  }

  /**
   * Converts the `TimeRanges` object into an array of buffered range objects.
   *
   * @param {TimeRanges|null} b - The buffer ranges object.
   * @returns {!Array<IBufferedRange>} An array of buffered range objects.
   */
  public static getBufferedInfo(b: TimeRanges | null): IBufferedRange[] {
    if (!b) {
      return [];
    }

    const result: IBufferedRange[] = [];
    for (let i = 0; i < b.length; i++) {
      result.push({ start: b.start(i), end: b.end(i) });
    }

    return result;
  }

  /**
   * Computes the last added buffered range by comparing old and new ranges.
   *
   * This operation can be potentially EXPENSIVE and should only be done in
   * debug builds for debugging purposes.
   * The algorithm is optimized to O(n) in the worst case, where n is the number of ranges.
   *
   * @param {TimeRanges|null} oldRanges - The previous buffer ranges.
   * @param {TimeRanges|null} newRanges - The new buffer ranges.
   * @returns {?IBufferedRange} The last added range, or `null` if no new range was added.
   */
  public static computeAddedRange(
    oldRanges: TimeRanges | null,
    newRanges: TimeRanges | null,
  ): IBufferedRange | null {
    // Specification Guarantee: The TimeRanges object is defined to have its ranges in increasing order
    // (i.e., start(0) ≤ start(1) ≤ ...).
    const oldBuffered = this.getBufferedInfo(oldRanges);
    const newBuffered = this.getBufferedInfo(newRanges);

    if (!oldBuffered.length) {
      // Nothing to compare with.
      return null;
    }

    if (!newBuffered.length) {
      // If newRanges is empty, return the very last (if any).
      return newBuffered.pop() || null;
    }

    // Use two pointers starting from the end (i.e. highest times) of both arrays.
    let i = newBuffered.length - 1;
    let j = oldBuffered.length - 1;

    // Iterate through new ranges from the latest one backwards.
    while (i >= 0) {
      const newRange = newBuffered[i];

      // Move the old pointer while the current old range ends after the new range.
      while (j >= 0 && oldBuffered[j].end > newRange.end) {
        j--;
      }

      // If no old range remains or the candidate old range ends before newRange starts,
      // then this entire newRange is new.
      if (j < 0 || oldBuffered[j].end < newRange.start) {
        return newRange;
      }

      // At this point, we have an old range whose end is between newRange.start and newRange.end.
      // If that old range doesn’t completely cover newRange, return the extra part.
      if (oldBuffered[j].end < newRange.end) {
        return { start: oldBuffered[j].end, end: newRange.end };
      }

      // Otherwise, the new range is completely contained in the old range.
      // Check the next new range.
      i--;
    }

    return null;
  }
}
