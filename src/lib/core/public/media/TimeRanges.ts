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
    if (!b || !b.length) {
      return null;
    }

    if (this._isBufferNegligible(b)) {
      return null;
    }

    const ranges = this.getBufferedInfo(b);

    const idx = ranges.findIndex((item, i, arr) => {
      const prev = arr[i - 1];

      return item.start > time && (i === 0 || prev.end - time <= threshold);
    });

    return idx >= 0 ? idx : null;
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
   * The algorithm is O(n^2) in the worst case, where n is the number of ranges.
   *
   * @param {TimeRanges|null} oldRanges - The previous buffer ranges.
   * @param {TimeRanges|null} newRanges - The new buffer ranges.
   * @returns {?IBufferedRange} The last added range, or `null` if no new range was added.
   */
  public static computeAddedRange(
    oldRanges: TimeRanges | null,
    newRanges: TimeRanges | null,
  ): IBufferedRange | null {
    if (!oldRanges || !oldRanges.length) {
      return null;
    }

    if (!newRanges || !newRanges.length) {
      return this.getBufferedInfo(newRanges).pop() || null;
    }

    const newRangesReversed = this.getBufferedInfo(newRanges).reverse();
    const oldRangesReversed = this.getBufferedInfo(oldRanges).reverse();

    for (const newRange of newRangesReversed) {
      let foundOverlap = false;

      for (const oldRange of oldRangesReversed) {
        if (newRange.start <= oldRange.end && oldRange.end <= newRange.end) {
          foundOverlap = true;

          // If the new range goes beyond the corresponding old one, the difference is newly added.
          if (oldRange.end < newRange.end) {
            return { start: oldRange.end, end: newRange.end };
          }
        }
      }

      if (!foundOverlap) {
        return newRange;
      }
    }

    return null;
  }
}

// Предположим, у нас есть два массива диапазонов:

// oldRanges (старые диапазоны):

// [1, 5] [6, 10] [12, 15]
// newRanges (новые диапазоны):
// [4, 8] [9, 12] [14, 18]

// 1___4.5.6_8.9.10_12_14.15___18
//     |                        |

// В нашем примере:

// newRangesReversed = [{ start: 14, end: 18 }, { start: 9, end: 12 }, { start: 4, end: 8 }]
// oldRangesReversed = [{ start: 12, end: 15 }, { start: 6, end: 10 }, { start: 1, end: 5 }]

// Для этого примера, новый диапазон [14, 18]
// не пересекается с какими-либо старими диапазонами, поэтому он и будет возвращен как результат.
