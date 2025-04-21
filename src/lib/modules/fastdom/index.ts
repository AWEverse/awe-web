import { setDOMPhase } from "./stricterdom";
import safeExecDOM from "./safeExecDOM";
import throttleWithRafFallback from "./throttleWithRafFallback";
import { UnrolledTaskQueue } from "@/lib/core";

export type TaskFunction = () => void;
export type ReflowTaskFunction = () => TaskFunction | void;
type ErrorHandler = (error: Error) => void;

let handleError: ErrorHandler = (error) =>
  console.error("DOM task error:", error);

const measureTasks = new UnrolledTaskQueue<TaskFunction>();
const mutationTasks = new UnrolledTaskQueue<TaskFunction>();
const reflowTasks = new UnrolledTaskQueue<ReflowTaskFunction>();

function processTasks<T>(
  queue: UnrolledTaskQueue<T>,
  handler: (task: T) => void
) {
  if (queue.length === 0) return;

  queue.drainEach((task) => {
    try {
      handler(task);
    } catch (error) {
      handleError(error as Error);
    }
  });
}

const runUpdatePass = throttleWithRafFallback(async () => {
  try {
    if (measureTasks.length > 0) {
      setDOMPhase("measure");
      processTasks(measureTasks, (task) => safeExecDOM(task));
    }

    await Promise.resolve(); // микро-задачи

    if (mutationTasks.length > 0) {
      setDOMPhase("mutate");
      processTasks(mutationTasks, (task) => safeExecDOM(task));
    }

    if (reflowTasks.length > 0) {
      setDOMPhase("measure");
      const followUp: TaskFunction[] = [];

      processTasks(reflowTasks, (task) =>
        safeExecDOM(() => {
          const result = task();
          if (result) followUp.push(result);
        })
      );

      if (followUp.length > 0) {
        setDOMPhase("mutate");
        for (const task of followUp) {
          try {
            safeExecDOM(task);
          } catch (err) {
            handleError(err as Error);
          }
        }
      }
    }
  } finally {
    setDOMPhase("measure");
  }
});

/**
 * Queue DOM read operations (measure phase).
 */
export function requestMeasure(fn: TaskFunction) {
  if (fn) {
    measureTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue DOM write operations (mutate phase).
 */
export function requestMutation(fn: TaskFunction) {
  if (fn) {
    mutationTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue measure-then-mutate operations.
 */
export function requestNextMutation(fn: ReflowTaskFunction) {
  if (fn) {
    reflowTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Set a global error handler for task failures.
 */
export function setTaskErrorHandler(handler: ErrorHandler) {
  handleError = handler;
}

export * from "./stricterdom";
