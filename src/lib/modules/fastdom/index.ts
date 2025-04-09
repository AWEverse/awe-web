import safeExecDOM from "./safeExecDOM";
import { setDOMPhase, type DOMPhase } from "./stricterdom";
import throttleWithRafFallback from "./throttleWithRafFallback";

export enum TaskPriority {
  High = 0,
  Normal = 1,
  Low = 2,
}

interface DOMTask {
  phase: DOMPhase;
  fn: NoneToVoidFunction | NoneToVoidFunction; // для reflow
  priority?: TaskPriority;
  target?: Element;
  signal?: AbortSignal;
}

type TaskBucket = Map<Element | null, DOMTask[]>;

const tasks: Record<DOMPhase, TaskBucket> = {
  measure: new Map(),
  mutate: new Map(),
  reflow: new Map(),
};

let scheduled = false;
let errorHandler = (error: Error) => console.error("DOM task error:", error);

function queueTask(task: DOMTask) {
  if (task.signal?.aborted) return;

  const bucket = tasks[task.phase];
  const key = task.target || null;

  if (!bucket.has(key)) {
    bucket.set(key, []);
  }

  bucket.get(key)!.push(task);

  if (!scheduled) {
    scheduled = true;
    runBatchedUpdate();
  }
}

function runPhaseTasks(
  phase: DOMPhase,
  exec: (fn: NoneToVoidFunction) => void,
  allowResult = false,
): NoneToVoidFunction[] {
  setDOMPhase(phase);
  const followUps: NoneToVoidFunction[] = [];

  for (const [_, taskList] of tasks[phase]) {
    for (const task of taskList) {
      if (task.signal?.aborted) continue;
      try {
        const result = exec(task.fn);
        if (allowResult && typeof result === "function") {
          followUps.push(result);
        }
      } catch (error) {
        errorHandler(error as Error);
      }
    }
  }

  tasks[phase].clear();
  return followUps;
}

const runBatchedUpdate = throttleWithRafFallback(async () => {
  try {
    const run = (fn: NoneToVoidFunction) => safeExecDOM(fn);

    runPhaseTasks("measure", run);
    await Promise.resolve();
    runPhaseTasks("mutate", run);

    const followUps = runPhaseTasks("reflow", run, true);
    if (followUps.length) {
      setDOMPhase("mutate");
      for (const fn of followUps) {
        try {
          run(fn);
        } catch (e) {
          errorHandler(e as Error);
        }
      }
    }
  } finally {
    scheduled = false;
    setDOMPhase("measure");
  }
});

export function requestDOMTask(task: DOMTask) {
  queueTask({
    ...task,
    priority: task.priority ?? TaskPriority.Normal,
  });
}

export function requestMeasure(
  fn: NoneToVoidFunction,
  options: Partial<DOMTask> = {},
) {
  requestDOMTask({ ...options, phase: "measure", fn });
}

export function requestMutation(
  fn: NoneToVoidFunction,
  options: Partial<DOMTask> = {},
) {
  requestDOMTask({ ...options, phase: "mutate", fn });
}

// TODO: rename to something like reflow
export function requestNextMutation(
  fn: () => NoneToVoidFunction,
  options: Partial<DOMTask> = {},
) {
  requestDOMTask({ ...options, phase: "reflow", fn });
}

export function setTaskErrorHandler(handler: (error: Error) => void) {
  errorHandler = handler;
}
