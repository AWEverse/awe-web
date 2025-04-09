// High-performance requestAnimationFrame alternative with minimal overhead
// Fallback to timeout, duplicate prevention, pooling, and separated queues

import { DEBUG } from "@/lib/config/dev";

const FAST_RAF_TIMEOUT_FALLBACK_MS = 35;

let callbackIdCounter = 0;

// Object pool to reduce GC pressure
class CallbackPool {
  private pool: CallbackEntry[] = [];

  acquire(): CallbackEntry {
    return (
      this.pool.pop() || {
        id: 0,
        callback: () => { },
        hasFallback: false,
        additionTime: 0,
        executed: false,
      }
    );
  }

  release(entry: CallbackEntry) {
    entry.callback = () => { };
    entry.hasFallback = false;
    entry.additionTime = 0;
    entry.executed = false;
    this.pool.push(entry);
  }
}

const pool = new CallbackPool();

// Queues for efficient separation of fallback and rAF scheduling
const rafQueue: CallbackEntry[] = [];
const timeoutQueue: CallbackEntry[] = [];

let nextTimeoutTime: number | undefined;
let timeoutId: ReturnType<typeof setTimeout> | undefined;
let rafScheduled = false;

// Track callbacks to prevent duplication
const callbackMap = new Map<NoneToVoidFunction, CallbackEntry>();

type CallbackEntry = {
  id: number;
  callback: NoneToVoidFunction;
  hasFallback: boolean;
  additionTime: number;
  executed: boolean;
};

function addCallback(callback: NoneToVoidFunction, hasFallback: boolean) {
  if (callbackMap.has(callback)) return;

  const entry = pool.acquire();
  entry.id = callbackIdCounter++;
  entry.callback = callback;
  entry.hasFallback = hasFallback;
  entry.additionTime = hasFallback ? Date.now() : 0;
  entry.executed = false;

  callbackMap.set(callback, entry);

  rafQueue.push(entry);

  if (hasFallback) {
    timeoutQueue.push(entry);
    const fallbackTime = entry.additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS;
    if (nextTimeoutTime === undefined || fallbackTime < nextTimeoutTime) {
      nextTimeoutTime = fallbackTime;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      const delay = Math.max(0, fallbackTime - Date.now());
      timeoutId = setTimeout(handleTimeout, delay);
    }
  }
}

function handleTimeout() {
  const now = Date.now();
  let minTime = Infinity;
  const nextQueue: CallbackEntry[] = [];

  for (let i = 0; i < timeoutQueue.length; ++i) {
    const entry = timeoutQueue[i];
    if (entry.executed) continue;

    const targetTime = entry.additionTime + FAST_RAF_TIMEOUT_FALLBACK_MS;
    if (targetTime <= now) {
      executeCallback(entry);
    } else {
      if (targetTime < minTime) minTime = targetTime;
      nextQueue.push(entry);
    }
  }

  timeoutQueue.length = 0;
  timeoutQueue.push(...nextQueue);

  if (timeoutQueue.length > 0 && minTime < Infinity) {
    nextTimeoutTime = minTime;
    const delay = Math.max(0, minTime - Date.now());
    timeoutId = setTimeout(handleTimeout, delay);
  } else {
    nextTimeoutTime = undefined;
    timeoutId = undefined;
  }
}

function executeCallback(entry: CallbackEntry) {
  if (entry.executed) return;
  try {
    entry.callback();
  } catch (e) {
    if (DEBUG) console.error("Error in fastRaf callback:", e);
  }
  entry.executed = true;
  callbackMap.delete(entry.callback);
  pool.release(entry);
}

function executeAllCallbacks() {
  for (let i = 0; i < rafQueue.length; ++i) {
    const entry = rafQueue[i];
    executeCallback(entry);
  }
  rafQueue.length = 0;
}

export default function fastRaf(callback: NoneToVoidFunction, withTimeoutFallback = false) {
  addCallback(callback, withTimeoutFallback);

  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      executeAllCallbacks();
      rafScheduled = false;
    });
  }
}
