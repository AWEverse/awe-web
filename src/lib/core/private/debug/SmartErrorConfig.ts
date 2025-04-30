/**
 * Configuration options for SmartError styling and behavior.
 */
export class SmartErrorConfig {
  static colors = {
    header: (text: string) => `\x1b[31m${text}\x1b[39m`,   // Red
    step: (text: string) => `\x1b[33m${text}\x1b[39m`,    // Yellow
    timestamp: (text: string) => `\x1b[34m${text}\x1b[39m`, // Blue
    end: (text: string) => `\x1b[32m${text}\x1b[39m`      // Green
  };

  static colorEnabled: boolean = (() => {
    try {
      return Boolean(process.stdout?.isTTY && !("NO_COLOR" in process.env));
    } catch {
      return false;
    }
  })();

  static showTimestamps = true;
  static indentSize = 2;
  static includeNativeStack = false;
}
