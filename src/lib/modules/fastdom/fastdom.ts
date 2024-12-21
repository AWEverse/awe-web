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

// Запрашивает задачу для фазы измерения (measure) и добавляет её в очередь.
// Функция runUpdatePassOnRaf обеспечивает выполнение задач на следующем кадре анимации.
export function requestMeasure(callback: NoneToVoidFunction) {
  pendingMeasureTasks.push(callback); // Добавляем задачу в очередь микротасков для измерения.
  runUpdatePassOnRaf(); // Планируем выполнение задач через requestAnimationFrame.
}

// Запрашивает задачу для фазы мутации (mutate) и добавляет её в очередь.
// Задачи мутации выполняются после задач измерения.
export function requestMutation(callback: NoneToVoidFunction) {
  pendingMutationTasks.push(callback); // Добавляем задачу в очередь микротасков для мутаций.
  runUpdatePassOnRaf(); // Планируем выполнение задач через requestAnimationFrame.
}

// Запрашивает задачу для следующей фазы мутации, которая выполняется после фазы измерения.
// В этом случае сначала планируется задача на измерение, а затем на мутацию.
export function requestNextMutation(callback: NoneToReflowTaskFunction) {
  // Планируем выполнение сначала измерения, затем мутации.
  requestMeasure(() => {
    requestMutation(callback);
  });
}

// Запрашивает принудительный Reflow (перерисовку), задача добавляется в соответствующую очередь.
// Принудительные задачи требуют выполнения всех изменений в DOM, что может замедлить работу.
export function requestForcedReflow(callback: NoneToReflowTaskFunction) {
  pendingForceReflowTasks.push(callback); // Добавляем задачу в очередь принудительных Reflow задач.
  runUpdatePassOnRaf(); // Планируем выполнение задач через requestAnimationFrame.
}

/*
Иллюстрация микротасков:

1. requestMeasure() -> Добавляет задачу для измерения в очередь.
2. requestMutation() -> Добавляет задачу для мутации в очередь.
3. requestNextMutation() -> Сначала планирует измерение, затем мутацию.
4. requestForcedReflow() -> Добавляет задачу принудительного Reflow в очередь.

runUpdatePassOnRaf() управляет всеми этими задачами через requestAnimationFrame, что позволяет эффективно распределять 
выполнение микротасков по фазам измерения и мутации для оптимизации перерисовки DOM.

*/

export * from './stricterdom';
