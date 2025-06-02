class PerformanceOptimizer {
  static scheduleRead(callback: () => void): void {
    requestAnimationFrame(callback);
  }

  static scheduleWrite(callback: () => void): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(callback);
    });
  }

  static createDebouncer(fn: () => void, delay: number): () => void {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fn, delay);
    };
  }
}

export default PerformanceOptimizer;
