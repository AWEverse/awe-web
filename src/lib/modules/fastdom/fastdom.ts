import safeExecDOM from './safeExecDOM';
import { setPhase } from './stricterdom';
import throttleWithRafFallback from './throttleWithRafFallback';

type NoneToReflowTaskFunction = () => NoneToVoidFunction | void;

let pendingMeasureTasks: NoneToVoidFunction[] = [];
let pendingMutationTasks: NoneToVoidFunction[] = [];
let pendingForceReflowTasks: NoneToReflowTaskFunction[] = [];

const runUpdatePassOnRaf = throttleWithRafFallback(() => {
  const currentMeasureTasks = pendingMeasureTasks;
  pendingMeasureTasks = [];
  currentMeasureTasks.forEach(task => {
    safeExecDOM(task);
  });

  // We use promises to provide correct order for Mutation Observer callback microtasks
  Promise.resolve()
    .then(() => {
      setPhase('mutate');

      const currentMutationTasks = pendingMutationTasks;
      pendingMutationTasks = [];

      currentMutationTasks.forEach(task => {
        safeExecDOM(task);
      });
    })
    .then(() => {
      setPhase('measure');

      const pendingForceReflowMutationTasks: NoneToVoidFunction[] = [];
      // Will include tasks created during the loop
      for (const task of pendingForceReflowTasks) {
        safeExecDOM(() => {
          const mutationTask = task();
          if (mutationTask) {
            pendingForceReflowMutationTasks.push(mutationTask);
          }
        });
      }
      pendingForceReflowTasks = [];

      return pendingForceReflowMutationTasks;
    })
    .then(pendingForceReflowMutationTasks => {
      setPhase('mutate');

      // Will include tasks created during the loop
      for (const task of pendingForceReflowMutationTasks) {
        safeExecDOM(task);
      }
    })
    .then(() => {
      setPhase('measure');
    });
});

export function requestMeasure(callback: NoneToVoidFunction) {
  pendingMeasureTasks.push(callback);
  runUpdatePassOnRaf();
}

export function requestMutation(callback: NoneToVoidFunction) {
  pendingMutationTasks.push(callback);
  runUpdatePassOnRaf();
}

export function requestNextMutation(callback: NoneToReflowTaskFunction) {
  requestMeasure(() => {
    requestMutation(callback);
  });
}

export function requestForcedReflow(callback: NoneToReflowTaskFunction) {
  pendingForceReflowTasks.push(callback);
  runUpdatePassOnRaf();
}

export * from './stricterdom';
