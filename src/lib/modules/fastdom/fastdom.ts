import safeExecDOM from "./safeExecDOM";
import { setPhase } from "./stricterdom";
import throttleWithRafFallback from "./throttleWithRafFallback";

type NoneToReflowTaskFunction = () => NoneToVoidFunction | void;

let pendingMeasureTasks: Set<NoneToVoidFunction> = new Set();
let pendingMutationTasks: Set<NoneToVoidFunction> = new Set();
let pendingForceReflowTasks: Set<NoneToReflowTaskFunction> = new Set();

const runUpdatePassOnRaf = throttleWithRafFallback(async () => {
  if (pendingMeasureTasks.size > 0) {
    setPhase("measure");
    const currentMeasureTasks = [...pendingMeasureTasks];
    pendingMeasureTasks.clear();

    currentMeasureTasks.forEach((task) => {
      safeExecDOM(task);
    });
  }

  // We use promises to ensure correct order for Mutation Observer fn microtasks
  await Promise.resolve();

  if (pendingMutationTasks.size > 0) {
    setPhase("mutate");
    const currentMutationTasks = [...pendingMutationTasks];
    pendingMutationTasks.clear();

    currentMutationTasks.forEach((task) => {
      safeExecDOM(task);
    });
  }

  const pendingForceReflowMutationTasks: NoneToVoidFunction[] = [];

  if (pendingForceReflowTasks.size > 0) {
    setPhase("measure");
    // Force reflows and add any additional mutation tasks that arise
    for (const task of pendingForceReflowTasks) {
      safeExecDOM(() => {
        const mutationTask = task();
        if (mutationTask) {
          pendingForceReflowMutationTasks.push(mutationTask);
        }
      });
    }
    pendingForceReflowTasks.clear();
  }

  if (pendingForceReflowMutationTasks.length > 0) {
    setPhase("mutate");
    pendingForceReflowMutationTasks.forEach((task) => {
      safeExecDOM(task);
    });
  }

  setPhase("measure");
});

/**
 * Request a task for the measure phase.
 *
 * This function schedules the provided fn to run during the 'measure' phase of the next animation frame.
 * Measure tasks are responsible for reading from the DOM (e.g., layout, style).
 *
 * @param {NoneToVoidFunction} fn - The function to be executed in the measure phase.
 *
 * @example
 * requestMeasure(() => {
 *   const width = element.offsetWidth; // Example of reading layout information
 *   console.log(`Element width: ${width}`);
 * });
 */
export function requestMeasure(fn: NoneToVoidFunction) {
  if (!pendingMeasureTasks.has(fn)) {
    pendingMeasureTasks.add(fn); // Add task to the measure queue
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

/**
 * Request a task for the mutate phase.
 *
 * This function schedules the provided fn to run during the 'mutate' phase of the next animation frame.
 * Mutation tasks are responsible for writing to the DOM (e.g., changing styles or attributes).
 *
 * @param {NoneToVoidFunction} fn - The function to be executed in the mutate phase.
 *
 * @example
 * requestMutation(() => {
 *   element.style.backgroundColor = 'blue'; // Example of mutating the DOM
 * });
 */
export function requestMutation(fn: NoneToVoidFunction) {
  if (!pendingMutationTasks.has(fn)) {
    pendingMutationTasks.add(fn); // Add task to the mutate queue
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

/**
 * Request a task for the next mutate phase, runs after the next measure phase.
 *
 * This function schedules a mutation task to be executed after the next measure phase, ensuring that the DOM has been read before making changes.
 * It first requests a measure task, and within that, requests a mutation task.
 *
 * @param {NoneToReflowTaskFunction} fn - The function to be executed in the next mutate phase, following the measure phase.
 *
 * @example
 * requestNextMutation(() => {
 *   element.style.height = `${element.offsetHeight + 10}px`; // Example of sequential measure and mutate
 * });
 */
export function requestNextMutation(fn: NoneToReflowTaskFunction) {
  requestMeasure(() => {
    requestMutation(fn);
  });
}

/**
 * Request a forced reflow task, which executes after all measure/mutate tasks.
 *
 * This function forces a reflow (layout recalculation) by executing the fn after all scheduled measure and mutate tasks.
 * If the fn returns another mutation task, that mutation will be scheduled in the subsequent mutate phase.
 *
 * @param {NoneToReflowTaskFunction} fn - The function to be executed, which forces a reflow and potentially schedules mutation tasks.
 *
 * @example
 * requestForcedReflow(() => {
 *   const height = element.scrollHeight; // Forces a reflow by reading layout
 *   return () => {
 *     element.style.height = `${height}px`; // Optional follow-up mutation
 *   };
 * });
 */
export function requestForcedReflow(fn: NoneToReflowTaskFunction) {
  if (!pendingForceReflowTasks.has(fn)) {
    pendingForceReflowTasks.add(fn); // Add forced reflow task
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

export * from "./stricterdom";
