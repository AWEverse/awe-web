/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEBUG } from '../config/dev';

/** Execute callback only in debug mode */
export const onlyDebug = (cb: () => void): void => {
  if (DEBUG) {
    cb();
  }
};

/* eslint-disable no-console */

/** Available debug levels for logging */
export const DEBUG_LEVELS = ['log', 'error', 'warn', 'info', 'debug'] as const;
export type DebugLevel = (typeof DEBUG_LEVELS)[number];

/** Original console functions for each debug level */
const ORIGINAL_FUNCTIONS: Record<DebugLevel, (...args: any[]) => void> = DEBUG_LEVELS.reduce(
  (acc, level) => {
    acc[level] = console[level];
    return acc;
  },
  {} as Record<DebugLevel, (...args: any[]) => void>,
);

/** Log entry structure */
export interface DebugEntry {
  level: DebugLevel;
  args: any[];
  timestamp: Date;
}

/** Options for initializing or customizing debug behavior */
interface DebugOptions {
  persistLogs?: boolean;
  filterLevels?: DebugLevel[];
}

let debugLogs: DebugEntry[] = [];

/** Log a debug message */
export function logDebugMessage(level: DebugLevel, ...args: any[]): void {
  const logEntry: DebugEntry = {
    level,
    args,
    timestamp: new Date(),
  };

  debugLogs.push(logEntry);
  ORIGINAL_FUNCTIONS[level](...args);
}

/** Initialize debug console with optional filtering and persistence */
export function initDebugConsole({ persistLogs = false, filterLevels = [...DEBUG_LEVELS] }: DebugOptions = {}): void {
  debugLogs = persistLogs ? debugLogs : []; // Optionally retain old logs

  DEBUG_LEVELS.forEach(level => {
    if (filterLevels.includes(level)) {
      console[level] = (...args: any[]) => {
        logDebugMessage(level, ...args);
      };
    }
  });
}

/** Restore original console functions and optionally clear logs */
export function disableDebugConsole(clearLogs = true): void {
  DEBUG_LEVELS.forEach(level => {
    console[level] = ORIGINAL_FUNCTIONS[level];
  });

  if (clearLogs) {
    debugLogs = [];
  }
}

/** Retrieve debug logs with optional filtering */
export function getDebugLogs(filterLevel?: DebugLevel): string {
  const logs = filterLevel ? debugLogs.filter(log => log.level === filterLevel) : debugLogs;
  return JSON.stringify(logs, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2);
}

/** Clear the debug logs manually */
export function clearDebugLogs(): void {
  debugLogs = [];
}

/** Export logs to a file or external service (extendable placeholder) */
export function exportDebugLogs(): void {
  const logData = getDebugLogs();
  // Extend here with logic to export logs, such as saving to a file or sending to a logging service
  console.info('Debug logs exported:', logData);
}
