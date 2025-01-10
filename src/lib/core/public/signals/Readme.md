# Signals State Management Library Guide

## Overview

**Signals** is a performant state management library aimed at making it easy to write business logic for apps of all sizes while keeping the application updates fast and automatic. It allows you to focus on the logic without worrying about manual optimization of state updates. The system automatically minimizes unnecessary updates, and lazy updates ensure efficient reactivity.

### Key Features:
- **Automatic optimization**: Automatically triggers the fewest updates necessary, ensuring fast app performance.
- **Framework integration**: Signals integrate seamlessly into frameworks like React, Preact, and Svelte as native primitives without requiring selectors or wrapper functions.
- **Built-in lazy updates**: Signals automatically skip those that no one listens to, saving resources.

## Core Concepts & API

The Signals library exposes four core functions for managing state:

### 1. `signal(initialValue)`

The `signal` function creates a new signal. A signal holds a value that can change over time, and components can subscribe to updates when the signal's value changes.

#### Example:
```javascript
import { signal } from "signals";

const counter = signal(0);

console.log(counter.value); // Output: 0
counter.value = 1;
```

### 2. `signal.peek()`

In some cases, you need to access the previous value of a signal without subscribing to it. `signal.peek()` lets you read the previous value.

#### Example:
```javascript
import { signal } from "signals";

const counter = signal(0);
const effectCount = signal(0);

effect(() => {
  effectCount.value = effectCount.peek() + 1;
});
```

### 3. `computed(fn)`

`computed` allows you to create derived signals based on other signals. The function you pass to `computed` is executed when any of its dependent signals change, and the result is stored as the computed signal's value.

#### Example:
```javascript
import { signal, computed } from "signals";

const name = signal("Jane");
const surname = signal("Doe");

const fullName = computed(() => name.value + " " + surname.value);

console.log(fullName.value); // Output: Jane Doe

name.value = "John";
console.log(fullName.value); // Output: John Doe
```

### 4. `effect(fn)`

The `effect` function allows you to run a side effect whenever a signal's value or any of its dependencies change. When you use `effect`, it automatically subscribes to any signals used within its callback.

#### Example:
```javascript
import { signal, effect } from "signals";

const name = signal("Jane");
const surname = signal("Doe");

effect(() => {
  console.log(name.value + " " + surname.value);
});

name.value = "John"; // Logs: John Doe
```

You can dispose of an effect and unsubscribe from all signals by calling the return value of the `effect` function.

```javascript
const dispose = effect(() => {
  console.log(name.value);
});
dispose(); // Unsubscribes the effect
```

### 5. `batch(fn)`

`batch` allows you to combine multiple updates within a single update cycle. Updates within a batch will not trigger re-renders until the batch is complete.

#### Example:
```javascript
import { signal, batch, effect } from "signals";

const name = signal("Jane");
const surname = signal("Doe");

effect(() => {
  console.log(name.value + " " + surname.value);
});

batch(() => {
  name.value = "Foo";
  surname.value = "Bar";
}); // Logs: Foo Bar
```

### 6. `untracked(fn)`

`untracked` prevents subscriptions from being made inside the provided function. This can be useful when you want to read signals without causing reactivity or side effects.

#### Example:
```javascript
import { signal, untracked } from "signals";

const counter = signal(0);
const effectCount = signal(0);

effect(() => {
  effectCount.value = untracked(() => counter.value + 1);
});
```

# Nesting

This component demonstrates how to use **Signals** and **Computed** values within a React application. It showcases reactive state management and how to structure nested objects, handle state updates, and optimize performance with **memoization** and **effects**.

## Key Features:
- **Reactive State**: Using signals (`useSignal`) to manage primitive values and reactive objects.
- **Computed Values**: Automatically update derived values using `useComputed`.
- **Memoization**: Optimize component re-renders with `memo`.
- **Effect Management**: Perform side effects with `useLayoutEffect`.
- **Render Count**: Display how many times a component has re-rendered to track performance.

---

## Code Breakdown

### 1. **Nesting Component**
The main component of the app, responsible for demonstrating state management and nested object reactivity.

```tsx
function Nesting() {
	const count: Count = useSignal(0);
	const add = () => count.value++;

	const showNumberKey = useSignal(false);

	const obj = useReactive({
		stringKey: "bar",
		numberKey: 123,
		boolKey: true,
		nullKey: null,
		object: { foo: "bar" },
	});

	return (
		<div className="nesting">
			{/* Render count with increment/decrement */}
			<p>
				<strong>count: </strong>
				<button onClick={() => count.value--}>–</button>
				<output>{count}</output>
				<button onClick={add}>+</button>
				<button onClick={() => add() + add()}>+ ×2</button>
			</p>
			{/* Render numberKey with edit and visibility toggle */}
			<div>
				<strong>numberKey: </strong>
				<button onClick={() => obj.numberKey.value--}>–</button>
				<output>{showNumberKey.value && obj.numberKey}</output>
				<button onClick={() => obj.numberKey.value++}>+</button>
				<label>
					<input
						type="checkbox"
						onChange={e => {
							showNumberKey.value = e.currentTarget.checked;
						}}
					/>
					show value
				</label>
			</div>
			{/* Render additional components */}
			<RenderCount />
			<ObjectEditor obj={obj} />
			<ComputedDemo count={count} />
			<Clock />
		</div>
	);
}
```

### 2. **ComputedDemo**
A component that shows how to use computed values to derive a new value from existing signals. It takes the `count` signal and calculates a constrained double value.

```tsx
const ComputedDemo = memo(({ count }: { count: Count }) => {
	const doubleCount = useComputed(() => {
		const double = count.value * 2;
		const constrained = Math.max(0, Math.min(double, 10));
		console.log(`doubleCount(${count.value}): ${constrained}`);
		return constrained;
	});

	return (
		<div style={{ padding: "10px 0", position: "relative" }}>
			<RenderCount />
			<strong>Double Count:</strong> {doubleCount}
		</div>
	);
});
```

### 3. **ObjectEditor**
A memoized component that allows you to edit and view the values of the `obj` reactive object. This component renders a table with editable inputs for each key in the object.

```tsx
const ObjectEditor = memo(({ obj }: { obj: DemoObj }) => {
	return (
		<div className="object-editor">
			<table>
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
						<th>Edit</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>stringKey:</td>
						<td>{obj.stringKey}</td>
						<td>
							<input
								onChange={e => (obj.stringKey.value = e.currentTarget.value)}
								value={obj.stringKey}
							/>
						</td>
					</tr>
					<tr>
						<td>numberKey:</td>
						<td>{obj.numberKey}</td>
						<td>
							<input
								type="number"
								onChange={e =>
									(obj.numberKey.value = e.currentTarget.valueAsNumber)
								}
								value={obj.numberKey}
							/>
						</td>
					</tr>
					<tr>
						<td>boolKey:</td>
						<td>{obj.boolKey}</td>
						<td>
							<input
								type="checkbox"
								onChange={e => (obj.boolKey.value = e.currentTarget.checked)}
								checked={obj.boolKey}
							/>
						</td>
					</tr>
				</tbody>
			</table>
			<RenderCount />
		</div>
	);
});
```

### 4. **Clock**
A component that shows the current time, updated every 100ms. The time is stored in a signal, and the formatted time is derived using `useComputed`.

```tsx
const Clock = memo(function () {
	const time = useSignal(Date.now());

	useLayoutEffect(() => {
		let timer = setInterval(() => {
			time.value = Date.now();
		}, 100);
		return () => clearInterval(timer);
	}, []);

	const formattedTime = useComputed(() => {
		return new Date(time.value).toLocaleTimeString();
	});

	return (
		<div className="clock">
			<time dateTime={formattedTime}>{formattedTime}</time>
			<RenderCount />
		</div>
	);
});
```

### 5. **RenderCount**
A utility component to show the number of times a component has re-rendered, useful for performance tracking.

```tsx
function useRenderCount() {
	const count = useRef(0);
	return ++count.current;
}
function RenderCount() {
	const renders = useRenderCount();
	const $root = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		$root.current!.animate([{ background: "rgba(150,100,255,.5)" }, {}], 250);
	});
	return (
		<div className="render-count" ref={$root} data-flash-ignore>
			rendered {renders} time{renders === 1 ? "" : "s"}
		</div>
	);
}
```

### 6. **Helper Functions**

- **useReactive**: A custom hook that converts an object into a reactive one using the `signal` function for each key.
```tsx
function useReactive<T extends object>(obj: T) {
	return useMemo(() => reactive(obj), []);
}
```

- **reactive**: Converts an object into a reactive object where each key is a `Signal`.
```tsx
function reactive<T extends object>(obj: T) {
	let reactive = {} as Reactive<T>;
	for (let i in obj) reactive[i] = signal(obj[i]);
	return reactive;
}
```

