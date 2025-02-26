import safeExecDOM from "./safeExecDOM";
import { setPhase } from "./stricterdom";
import throttleWithRafFallback from "./throttleWithRafFallback";

type TaskFunction = () => void;
type ReflowTaskFunction = () => TaskFunction | void;
type ErrorHandler = (error: Error) => void;

let handleError: ErrorHandler = (error) =>
  console.error("DOM task error:", error);

const measureTasks = new Set<TaskFunction>();
const mutationTasks = new Set<TaskFunction>();
const reflowTasks = new Set<ReflowTaskFunction>();

/**
 * Process all tasks in a given set with the provided handler.
 * Clears the set to allow new tasks to be queued.
 */
const processTasks = <T>(tasks: Set<T>, handler: (task: T) => void) => {
  if (!tasks.size) return;

  const queue = Array.from(tasks);
  tasks.clear();

  for (let i = 0, size = queue.length; i < size; i++) {
    try {
      handler(queue[i]);
    } catch (error) {
      handleError(error as Error);
    }
  }
};

/**
 * Flush all queued DOM tasks in the proper order:
 * 1. Measure phase (batch DOM reads).
 * 2. Yield microtasks.
 * 3. Mutation phase (batch DOM writes).
 * 4. Reflow phase (measure–then–mutate operations).
 *
 * This function is throttled via requestAnimationFrame using throttleWithRafFallback.
 */
const runUpdatePass = throttleWithRafFallback(async () => {
  try {
    // Phase 1: Measure (DOM reads)
    if (measureTasks.size) {
      setPhase("measure");
      processTasks(measureTasks, safeExecDOM);
    }

    // Allow pending microtasks to complete before mutations.
    await Promise.resolve();

    // Phase 2: Mutation (DOM writes)
    if (mutationTasks.size) {
      setPhase("mutate");
      processTasks(mutationTasks, safeExecDOM);
    }

    // Phase 3: Reflow (measure–then–mutate)
    if (reflowTasks.size) {
      setPhase("measure");
      const followUp: TaskFunction[] = [];

      processTasks(reflowTasks, (task) =>
        safeExecDOM(() => {
          const result = task();
          if (result) followUp.push(result);
        })
      );

      if (followUp.length) {
        setPhase("mutate");
        processTasks(new Set(followUp), safeExecDOM);
      }
    }
  } finally {
    setPhase("measure");
  }
});

/**
 * Queue a DOM read operation (measure phase).
 * Example:
 *   requestMeasure(() => console.log("Element width:", element.offsetWidth));
 */
export function requestMeasure(fn: TaskFunction) {
  if (!measureTasks.has(fn)) {
    measureTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue a DOM write operation (mutation phase).
 * Example:
 *   requestMutation(() => (element.style.color = "red"));
 */
export function requestMutation(fn: TaskFunction) {
  if (!mutationTasks.has(fn)) {
    mutationTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue a measure–then–mutate operation (reflow phase).
 * The passed function should perform a measurement and return a mutation task.
 * Example:
 *   requestNextMutation(() => {
 *     const height = element.offsetHeight;
 *     return () => (element.style.height = `${height}px`);
 *   });
 */
export function requestNextMutation(fn: ReflowTaskFunction) {
  if (fn && !reflowTasks.has(fn)) {
    reflowTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Set a custom error handler for DOM tasks.
 * @param handler The function to handle errors.
 */
export function setTaskErrorHandler(handler: ErrorHandler) {
  handleError = handler;
}

export * from "./stricterdom";
