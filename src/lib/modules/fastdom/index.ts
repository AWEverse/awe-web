import safeExecDOM from "./safeExecDOM";
import { setPhase } from "./stricterdom";
import throttleWithRafFallback from "./throttleWithRafFallback";

type TaskFunction = () => void;
type ReflowTaskFunction = () => TaskFunction | void;
type ErrorHandler = (error: Error) => void;
type SchedulerCallback = (didTimeout?: boolean) => void;
type Priority = "user-blocking" | "user-visible" | "background";

let handleError: ErrorHandler = (error) => console.error("DOM task error:", error);

const measureTasks = new Set<TaskFunction>();
const mutationTasks = new Set<TaskFunction>();
const reflowTasks = new Set<ReflowTaskFunction>();

const processTasks = <T>(tasks: Set<T>, handler: (task: T) => void): void => {
  if (tasks.size === 0) return;

  const queue = Array.from(tasks);
  tasks.clear();

  for (const task of queue) {
    try {
      handler(task);
    } catch (error) {
      handleError(error as Error);
    }
  }
};

const win = typeof window !== "undefined" ? window : ({} as any);
const hasScheduler = "scheduler" in win && typeof win.scheduler.postTask === "function";
const hasIdleCallback = "requestIdleCallback" in win;

const scheduler = (() => {
  if (hasScheduler) {
    return {
      postTask: (callback: SchedulerCallback, options?: { priority?: Priority }) =>
        win.scheduler.postTask(callback, options),
    };
  }

  if (hasIdleCallback) {
    return {
      postTask: (callback: SchedulerCallback, options?: { priority?: Priority }) => {
        const timeout =
          options?.priority === "user-blocking" ? 100 :
            options?.priority === "user-visible" ? 300 : 500;

        return win.requestIdleCallback(() => callback(false), { timeout });
      },
    };
  }

  return {
    postTask: (callback: SchedulerCallback) =>
      win.requestAnimationFrame(() => callback(false)),
  };
})();

const runUpdatePass = (() => {
  const update = async () => performUpdate();

  if (scheduler) {
    return (urgent = false) => {
      const priority: Priority = urgent ? "user-blocking" : "user-visible";
      scheduler.postTask(update, { priority });
    };
  }

  const throttledUpdate = throttleWithRafFallback(update);
  return () => throttledUpdate();
})();

async function performUpdate(): Promise<void> {
  try {
    if (measureTasks.size > 0) {
      setPhase("measure");
      processTasks(measureTasks, (task) => safeExecDOM(task));
    }

    await Promise.resolve();

    if (mutationTasks.size > 0) {
      setPhase("mutate");
      processTasks(mutationTasks, (task) => safeExecDOM(task));
    }

    if (reflowTasks.size > 0) {
      setPhase("measure");
      const followUp: TaskFunction[] = [];

      processTasks(reflowTasks, (task) =>
        safeExecDOM(() => {
          const result = task();
          if (result) followUp.push(result);
        })
      );

      if (followUp.length > 0) {
        setPhase("mutate");
        for (const task of followUp) {
          safeExecDOM(task);
        }
      }
    }
  } finally {
    setPhase("measure");
  }
}

/**
 * Queue DOM read operations (measure phase).
 * @param fn - Function to execute during measure phase
 * @param urgent - Whether to prioritize execution
 */
export function requestMeasure(fn: TaskFunction, urgent = false): void {
  if (fn && !measureTasks.has(fn)) {
    measureTasks.add(fn);
    runUpdatePass(urgent);
  }
}

/**
 * Queue DOM write operations (mutate phase).
 * @param fn - Function to execute during mutation phase
 * @param urgent - Whether to prioritize execution
 */
export function requestMutation(fn: TaskFunction, urgent = false): void {
  if (fn && !mutationTasks.has(fn)) {
    mutationTasks.add(fn);
    runUpdatePass(urgent);
  }
}

/**
 * Queue measure-then-mutate operations.
 * @param fn - Function that reads DOM and returns a write function
 * @param urgent - Whether to prioritize execution
 */
export function requestNextMutation(fn: ReflowTaskFunction, urgent = false): void {
  if (fn && !reflowTasks.has(fn)) {
    reflowTasks.add(fn);
    runUpdatePass(urgent);
  }
}

/**
 * Set a custom error handler for task execution errors.
 * @param handler - Function to handle errors
 */
export function setTaskErrorHandler(handler: ErrorHandler): void {
  handleError = handler;
}

export * from "./stricterdom";
