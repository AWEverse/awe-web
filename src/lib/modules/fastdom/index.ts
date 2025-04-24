// dom-task-scheduler/index.ts

import { setDOMPhase } from "./stricterdom";
import safeExecDOM from "./safeExecDOM";
import throttleWithRafFallback from "./throttleWithRafFallback";
import { UnrolledTaskQueue } from "@/lib/core";

export enum DOMPhase {
  Measure = "measure",
  Mutate = "mutate",
}

export type TaskFunction = () => void;
export type ReflowTaskFunction = () => TaskFunction | void;
export type ErrorHandler = (error: Error) => void;

const measureTasks = new UnrolledTaskQueue<TaskFunction>();
const mutationTasks = new UnrolledTaskQueue<TaskFunction>();
const reflowTasks = new UnrolledTaskQueue<ReflowTaskFunction>();

let handleError: ErrorHandler = (error) =>
  console.error("[DOMTaskScheduler] Error:", error);

const MAX_MICROTASK_DEPTH = 100;
let microtaskDepth = 0;

const setPhase = (phase: DOMPhase) => setDOMPhase(phase);
const execTask = (task: TaskFunction) => safeExecDOM(task);

const processTasks = <T>(
  queue: UnrolledTaskQueue<T>,
  handler: (task: T) => void
) => {
  if (queue.length === 0) return;

  queue.drainEach((task) => {
    try {
      handler(task);
    } catch (error) {
      handleError(error as Error);
    }
  });
};

const runUpdatePass = throttleWithRafFallback(async () => {
  if (
    measureTasks.length === 0 &&
    mutationTasks.length === 0 &&
    reflowTasks.length === 0
  ) {
    return;
  }

  try {
    if (measureTasks.length > 0) {
      setPhase(DOMPhase.Measure);
      processTasks(measureTasks, execTask);
    }

    queueMicrotask(() => {
      if (++microtaskDepth > MAX_MICROTASK_DEPTH) {
        handleError(
          new Error("Exceeded max microtask depth. Possible infinite microtask loop.")
        );
        return;
      }

      try {
        if (mutationTasks.length > 0) {
          setPhase(DOMPhase.Mutate);
          processTasks(mutationTasks, execTask);
        }

        if (reflowTasks.length > 0) {
          setPhase(DOMPhase.Measure);
          processTasks(reflowTasks, (task) => {
            const followUp: TaskFunction[] = [];

            safeExecDOM(() => {
              const result = task();
              if (typeof result === "function") followUp.push(result);
            });

            if (followUp.length > 0) {
              setPhase(DOMPhase.Mutate);
              for (const task of followUp) {
                try {
                  safeExecDOM(task);
                } catch (err) {
                  handleError(err as Error);
                }
              }
              followUp.length = 0;
            }
          });
        }
      } finally {
        microtaskDepth--;
      }
    });
  } finally {
    setPhase(DOMPhase.Measure);
  }
});

function schedule<T extends TaskFunction | ReflowTaskFunction>(
  queue: UnrolledTaskQueue<T>,
  task: T,
  signal?: AbortSignal
) {
  if (!task) return;
  if (signal?.aborted) return;

  if (signal) {
    const abortListener = () => queue.delete(task);
    signal.addEventListener("abort", abortListener, { once: true });
  }

  queue.add(task);
  runUpdatePass();
}

export function requestMeasure(fn: TaskFunction, signal?: AbortSignal) {
  schedule(measureTasks, fn, signal);
}

export function requestMutation(fn: TaskFunction, signal?: AbortSignal) {
  schedule(mutationTasks, fn, signal);
}

export function requestNextMutation(fn: ReflowTaskFunction, signal?: AbortSignal) {
  schedule(reflowTasks, fn, signal);
}

export function setTaskErrorHandler(handler: ErrorHandler) {
  handleError = handler;
}


export const __internal = {
  runUpdatePass,
  queues: {
    measureTasks,
    mutationTasks,
    reflowTasks,
  },
};
