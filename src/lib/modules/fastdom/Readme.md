# FasDOM: Fast & Safe DOM Scheduler

FasDOM is a high-performance, task-level DOM scheduler designed to coordinate DOM reads and writes with maximum safety and efficiency. It minimizes layout thrashing, avoids race conditions, and enables granular task control, including priorities, task grouping, and cancellation.

---

## ✨ Features

- **Explicit DOM Phases**: `measure`, `mutate`, `reflow` phases for predictable DOM access.
- **Per-element Task Grouping**: Tasks can be grouped by `target` (DOM element).
- **Task Priorities**: `High`, `Normal`, `Low` to determine task importance.
- **Abortable Tasks**: Tasks can be cancelled via `AbortSignal`.
- **Deferred Execution**: Uses `requestAnimationFrame` and microtasks to batch work efficiently.
- **Safe Execution**: Internal task wrapper catches and reports errors without halting the pipeline.
- **Pluggable Error Handling**: Global handler for task errors.

---

## 🧠 Architecture

FasDOM internally manages three buckets of tasks:

```ts
measure: Map<Element | null, DOMTask[]>
mutate: Map<Element | null, DOMTask[]>
reflow: Map<Element | null, DOMTask[]>
```

All tasks are grouped by DOM `target` (if provided) to allow for de-duplication and aggregation. Execution is throttled using a `requestAnimationFrame` fallback system for optimal frame timing.

---

## 🛠 API Reference

### `requestMeasure(fn: () => void, options?: Partial<DOMTask>)`
Queue a DOM read task.

```ts
requestMeasure(() => {
  const width = element.offsetWidth;
  console.log("Width:", width);
}, {
  target: element,
  signal: abortController.signal
});
```

### `requestMutation(fn: () => void, options?: Partial<DOMTask>)`
Queue a DOM write/mutation task.

```ts
requestMutation(() => {
  element.style.color = "red";
});
```

### `requestReflow(fn: () => () => void, options?: Partial<DOMTask>)`
Queue a read followed by a write.

```ts
requestReflow(() => {
  const height = element.offsetHeight;
  return () => {
    element.style.height = `${height}px`;
  };
});
```

### `requestDOMTask(task: DOMTask)`
Low-level API for queueing any task with full control.

```ts
requestDOMTask({
  phase: "mutate",
  fn: () => applyStyles(),
  target: box,
  priority: TaskPriority.High,
  signal: controller.signal
});
```

### `setTaskErrorHandler(handler: (err: Error) => void)`
Provide a global error handler for task exceptions.

```ts
setTaskErrorHandler((err) => reportError(err));
```

---

## 🧬 Task Execution Order

1. **All `measure` tasks**
2. **Microtasks**
3. **All `mutate` tasks**
4. **All `reflow` tasks**, followed by their returned `mutate` functions

Execution order within each phase is stable but may be influenced by `priority` (planned for future versions).

---

## 🔒 Safety Mechanisms

- Every task is executed via `safeExecDOM(fn)` to catch exceptions.
- Aborted tasks (via `AbortSignal`) are skipped.
- Invalid or duplicate tasks are ignored.

---

## 📦 Types

```ts
type DOMPhase = "measure" | "mutate" | "reflow";

interface DOMTask {
  phase: DOMPhase;
  fn: () => void | (() => void); // `reflow` tasks return a mutate function
  priority?: TaskPriority;
  target?: Element;
  signal?: AbortSignal;
}

enum TaskPriority {
  High = 0,
  Normal = 1,
  Low = 2,
}
```

---

## 🧪 Testing & Debugging

For debug environments, you can monkey-patch `safeExecDOM`, `setPhase`, or hook into execution lifecycle for logging and profiling. You may also inspect the task queues via `console.log(tasks)`.

---

## 🔭 Roadmap

- ✅ Task priorities enforcement (currently placeholder)
- 🔄 Dynamic task deduplication based on task identity
- ⛔ Auto-dispose on element removal
- 🧩 Reactive signal integration
- 📊 Frame budget control & slicing

---

## 📘 Summary

FasDOM is ideal for apps requiring low-latency DOM operations without layout thrashing. It gives you control and safety, while staying compatible with both imperative and reactive paradigms.

Use it where precision and performance matter.

---

> Built for developers who care about performance, reliability, and maintainable UI logic.

