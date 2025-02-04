if (!Array.prototype.select) {
  Object.defineProperty(Array.prototype, "select", {
    value: function <T, S>(
      this: T[],
      selector: (item: T, index: number, array: T[]) => S,
    ): S[] {
      if (typeof selector !== "function")
        throw new TypeError("Selector must be a function");

      const length = this.length;
      const result = new Array<S>(length); // Pre-allocate result array
      let count = 0;

      for (let i = 0; i < length; i++) {
        // Check for sparse array entries
        if (i in this) {
          result[count++] = selector(this[i], i, this);
        }
      }
      // Truncate to actual length (if array was sparse)
      result.length = count;
      return result;
    },
    writable: true,
    configurable: true,
    enumerable: false, // Non-enumerable to avoid interfering with for..in loops
  });
}
