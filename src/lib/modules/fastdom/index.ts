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

const processTasks = <T>(tasks: Set<T>, handler: (task: T) => void) => {
  if (tasks.size === 0) return;

  const queue = Array.from(tasks);
  tasks.clear();

  for (let j = 0, len = queue.length; j < len; j++) {
    try {
      handler(queue[j]);
    } catch (error) {
      handleError(error as Error);
    }
  }
};

const runUpdatePass = throttleWithRafFallback(async () => {
  try {
    if (measureTasks.size) {
      setPhase("measure");
      processTasks(measureTasks, (task) => safeExecDOM(task));
    }

    // Ждем завершения микротасков
    await Promise.resolve(); // Позволяем выполниться микротаскам

    // Фаза мутации
    if (mutationTasks.size) {
      setPhase("mutate");
      processTasks(mutationTasks, (task) => safeExecDOM(task));
    }

    if (reflowTasks.size) {
      setPhase("measure");
      const followUp: TaskFunction[] = [];

      processTasks(reflowTasks, (task) =>
        safeExecDOM(() => {
          const result = task();
          if (result) followUp.push(result);
        }),
      );

      if (followUp.length) {
        setPhase("mutate");
        processTasks(new Set(followUp), (task) => safeExecDOM(task));
      }
    }
  } finally {
    setPhase("measure");
  }
});

/**
 * Queue DOM read operations (measure phase).
 * @example
 * requestMeasure(() => console.log("Element width:", element.offsetWidth));
 */
export function requestMeasure(fn: TaskFunction) {
  if (!measureTasks.has(fn)) {
    measureTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue DOM write operations (mutate phase).
 * @example
 * requestMutation(() => element.style.color = "red");
 */
export function requestMutation(fn: TaskFunction) {
  if (!mutationTasks.has(fn)) {
    mutationTasks.add(fn);
    runUpdatePass();
  }
}

/**
 * Queue measure-then-mutate operations.
 * @example
 * requestNextMutation(() => {
 *   const height = element.offsetHeight;
 *   return () => element.style.height = `${height}px`;
 * });
 */
export function requestNextMutation(fn: ReflowTaskFunction) {
  if (fn && !reflowTasks.has(fn)) {
    reflowTasks.add(fn);
    runUpdatePass();
  }
}

export function setTaskErrorHandler(handler: ErrorHandler) {
  handleError = handler;
}

export * from "./stricterdom";
