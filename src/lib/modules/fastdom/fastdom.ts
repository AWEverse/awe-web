import safeExecDOM from './safeExecDOM';
import { setPhase } from './stricterdom';
import throttleWithRafFallback from './throttleWithRafFallback';

type NoneToReflowTaskFunction = () => NoneToVoidFunction | void;

let pendingMeasureTasks: Set<NoneToVoidFunction> = new Set();
let pendingMutationTasks: Set<NoneToVoidFunction> = new Set();
let pendingForceReflowTasks: Set<NoneToReflowTaskFunction> = new Set();

const runUpdatePassOnRaf = throttleWithRafFallback(async () => {
  if (pendingMeasureTasks.size > 0) {
    setPhase('measure');
    const currentMeasureTasks = [...pendingMeasureTasks];
    pendingMeasureTasks.clear();

    currentMeasureTasks.forEach(task => {
      safeExecDOM(task);
    });
  }

  // We use promises to ensure correct order for Mutation Observer callback microtasks
  await Promise.resolve();

  if (pendingMutationTasks.size > 0) {
    setPhase('mutate');
    const currentMutationTasks = [...pendingMutationTasks];
    pendingMutationTasks.clear();

    currentMutationTasks.forEach(task => {
      safeExecDOM(task);
    });
  }

  const pendingForceReflowMutationTasks: NoneToVoidFunction[] = [];

  if (pendingForceReflowTasks.size > 0) {
    setPhase('measure');
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
    setPhase('mutate');
    pendingForceReflowMutationTasks.forEach(task => {
      safeExecDOM(task);
    });
  }

  setPhase('measure');
});

// Request a task for the measure phase
export function requestMeasure(callback: NoneToVoidFunction) {
  if (!pendingMeasureTasks.has(callback)) {
    pendingMeasureTasks.add(callback); // Add task to the measure queue
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

// Request a task for the mutate phase, runs after measure tasks
export function requestMutation(callback: NoneToVoidFunction) {
  if (!pendingMutationTasks.has(callback)) {
    pendingMutationTasks.add(callback); // Add task to the mutate queue
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

// Request a task for the next mutate phase, runs after the next measure phase
export function requestNextMutation(callback: NoneToReflowTaskFunction) {
  requestMeasure(() => {
    requestMutation(callback);
  });
}

// Request a forced reflow task, which executes after all measure/mutate tasks
export function requestForcedReflow(callback: NoneToReflowTaskFunction) {
  if (!pendingForceReflowTasks.has(callback)) {
    pendingForceReflowTasks.add(callback); // Add forced reflow task
    runUpdatePassOnRaf(); // Schedule tasks via requestAnimationFrame
  }
}

export * from './stricterdom';
