import { DEBUG } from "@/lib/config/dev";

const Colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[39m`,   // red
  yellow: (text: string) => `\x1b[33m${text}\x1b[39m`, // yellow
  blue: (text: string) => `\x1b[34m${text}\x1b[39m`,    // blue
  green: (text: string) => `\x1b[32m${text}\x1b[39m`,   // green
};

type StackEntry = {
  text: string;
  level: number;
  timestamp: string;
};

export default class SmartError extends Error {
  private errorStack: StackEntry[] = [];
  private currentLevel: number = 0;

  constructor(message: string, position: string = "unknown") {
    super(message);
    this.name = "SmartError";
    this.addStep(`Error occurred at: ${position}`);
  }

  private pushEntry(text: string): void {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
    this.errorStack.push({ text, level: this.currentLevel, timestamp });
  }

  addStep(step: string): this {
    this.pushEntry(step);
    return this;
  }

  addCall(funcName: string): this {
    this.currentLevel++;
    this.pushEntry(`call ${funcName}`);
    return this;
  }

  endCall(): this {
    if (this.currentLevel > 0) {
      this.currentLevel--;
    }
    return this;
  }

  chain(actions: { type: "step" | "call"; value: string }[]): this {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (action.type === "step") {
        this.addStep(action.value);
      } else {
        this.addCall(action.value);
      }
    }
    return this;
  }

  getErrorTrace(): string {
    let parts: string[] = [`${Colors.red(`[${this.name}: ${this.message}]`)}`];
    const stack = this.errorStack;
    const stackLength = stack.length;
    const lastIndex = stackLength - 1;

    for (let i = 0; i < stackLength; i++) {
      const entry = stack[i];
      const isLast = i === lastIndex;
      const indent = "  ".repeat(entry.level);
      const branch = isLast ? "└─" : "├─";
      const timestamp = Colors.blue(`[${entry.timestamp}]`);
      const stepText = Colors.yellow(entry.text);

      parts.push(`${indent}${branch} ${timestamp} ${stepText}`);
    }

    parts.push(`└─ ${Colors.green(`[${this.name}]`)}`);
    return parts.join("\n");
  }

  log(): this {
    if (DEBUG) {
      console.error(this.getErrorTrace());
    }
    return this;
  }

  prepare(): string {
    return this.getErrorTrace();
  }

  throw(): never {
    throw this;
  }
}
