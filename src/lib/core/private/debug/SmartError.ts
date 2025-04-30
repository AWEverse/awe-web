import { DEBUG } from "@/lib/config/dev";
import { SmartErrorConfig } from "./SmartErrorConfig";


type StackEntry = {
  text: string;
  level: number;
  timestamp: string;
};

interface CallAction {
  type: "call";
  value: string;
}

interface StepAction {
  type: "step";
  value: string;
}

type StackAction = CallAction | StepAction;

/**
 * Enhanced error class with hierarchical tracing and customizable output.
 *
 * Example usage:
 * ```ts
 * new SmartError('Failed to load config', 'loadConfig')
 *   .addCall('readFile')
 *   .addStep('Opening file failed')
 *   .endCall()
 *   .log()
 * ```
 */
export default class SmartError extends Error {
  private errorStack: StackEntry[] = [];
  private currentLevel: number = 0;

  /**
   * Creates a new SmartError instance.
   * @param message - Error message
   * @param position - Optional context location
   * @param cause - Optional original error
   */
  constructor(message: string, position: string = "unknown", public readonly cause?: Error) {
    super(message);
    this.name = "SmartError";
    this.addStep(`Error occurred at: ${position}`);
    Error.captureStackTrace?.(this, SmartError);
  }

  private pushEntry(text: string): void {
    const timestamp = SmartErrorConfig.showTimestamps
      ? new Date().toISOString().slice(11, 23)
      : "";
    this.errorStack.push({ text, level: this.currentLevel, timestamp });
  }

  /**
   * Adds a descriptive step to the error trace.
   * @param step - Human-readable explanation of an execution step
   */
  addStep(step: string): this {
    this.pushEntry(step);
    return this;
  }

  /**
   * Begins a new logical call frame in the error trace.
   * @param funcName - Name of the function being entered
   */
  addCall(funcName: string): this {
    this.currentLevel++;
    this.pushEntry(`call ${funcName}`);
    return this;
  }

  /**
   * Ends the most recent logical call frame.
   */
  endCall(): this {
    if (this.currentLevel > 0) {
      this.currentLevel--;
    }
    return this;
  }

  /**
   * Applies a sequence of actions to build the trace.
   * @param actions - Array of steps/calls to apply
   */
  chain(actions: StackAction[]): this {
    actions.forEach((action) => {
      if (action.type === "step") {
        this.addStep(action.value);
      } else {
        this.addCall(action.value);
      }
    });
    return this;
  }

  /**
   * Returns the full error trace as a human-readable string.
   */
  getErrorTrace(): string {
    const parts: string[] = [
      this.colorize("header", `[${this.name}: ${this.message}]`),
    ];

    const stack = this.errorStack;
    const lastIdx = stack.length - 1;

    for (let i = 0; i < stack.length; i++) {
      const entry = stack[i];
      const isLast = i === lastIdx;
      const indent = " ".repeat(SmartErrorConfig.indentSize * entry.level);
      const branch = isLast ? "└─" : "├─";
      const ts = entry.timestamp
        ? ` ${this.colorize("timestamp", `[${entry.timestamp}]`)}` : "";
      const text = this.colorize("step", entry.text);

      parts.push(`${indent}${branch} ${ts} ${text}`);
    }

    parts.push(`└─ ${this.colorize("end", `[${this.name}]`)}`);

    if (SmartErrorConfig.includeNativeStack && this.stack) {
      parts.push("\n[NATIVE STACK]");
      parts.push(this.stack);
    }

    return parts.join("\n");
  }

  private colorize<T extends keyof typeof SmartErrorConfig.colors>(
    type: T,
    text: string
  ): string {
    return SmartErrorConfig.colorEnabled ? SmartErrorConfig.colors[type](text) : text;
  }

  /**
   * Logs the error trace to the console if in debug mode.
   */
  log(): this {
    if (DEBUG) {
      console.error(this.getErrorTrace());
    }
    return this;
  }

  /**
   * Throws the error immediately.
   */
  throw(): never {
    throw this;
  }

  /**
   * Returns the formatted error trace as a string.
   */
  toString(): string {
    return this.getErrorTrace();
  }

  /**
   * Exposes the error stack and metadata in a structured format.
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      cause: (this.cause && typeof (this.cause as any).toJSON === "function")
        ? (this.cause as any).toJSON()
        : this.cause,
      stack: this.errorStack.map(({ level, timestamp, text }) => ({
        level,
        timestamp,
        text,
      })),
    };
  }

  /**
   * Overrides the native `Error.stack` getter to return the formatted trace.
   */
  override get stack(): string {
    return this.getErrorTrace();
  }
}
