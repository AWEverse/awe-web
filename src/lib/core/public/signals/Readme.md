# Reactive Signals Library

A lightweight, efficient reactive programming library that provides fine-grained reactivity through signals. This library enables automatic dependency tracking and updates when data changes, making it easy to build reactive applications with minimal overhead.

## Table of Contents

- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Performance Considerations](#performance-considerations)
- [Path-Based Reactivity](#path-based-reactivity)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Implementation Details](#implementation-details)
- [Troubleshooting](#troubleshooting)

## Installation

```bash
npm install reactive-signals
```

## Core Concepts

### Signals

Signals are reactive values that automatically track dependencies and notify subscribers when they change. The library provides three main types of signals:

1. **Plain Signals**: Mutable containers for values that notify dependents when changed
2. **Computed Signals**: Read-only signals that derive their value from other signals
3. **Effects**: Side effects that run when their dependencies change

### Dependency Tracking

The library automatically tracks dependencies between signals, creating a reactive graph. When a signal's value changes, only the dependent computations and effects that rely on it are re-evaluated.

## Basic Usage

### Creating and Using Signals

```typescript
import { signal, computed, effect } from 'reactive-signals';

// Create a plain signal
const count = signal(0);

// Create a computed signal that depends on the count
const doubled = computed(() => count.value * 2);

// Create an effect that runs when dependencies change
const dispose = effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
});

// Update the signal value
count.value = 5; // The effect will automatically run again

// Dispose the effect when no longer needed
dispose();
```

### Batching Updates

```typescript
import { signal, batch } from 'reactive-signals';

const firstName = signal('John');
const lastName = signal('Doe');

// Batch multiple updates to only trigger effects once
batch(() => {
  firstName.value = 'Jane';
  lastName.value = 'Smith';
});
```

## API Reference

### `signal<T>(initialValue?: T): Signal<T>`

Creates a new plain signal with an optional initial value.

```typescript
const count = signal(0);
const name = signal<string>(); // undefined initially
```

### `computed<T>(fn: () => T): ReadonlySignal<T>`

Creates a read-only signal that derives its value from other signals.

```typescript
const fullName = computed(() => `${firstName.value} ${lastName.value}`);
```

### `effect(fn: () => void | (() => void)): () => void`

Creates an effect that runs when its dependencies change. The callback can return a cleanup function.

```typescript
const dispose = effect(() => {
  document.title = `Count: ${count.value}`;

  // Optional cleanup function
  return () => {
    document.title = 'Default Title';
  };
});
```

### `batch<T>(fn: () => T): T`

Batches multiple signal updates to trigger dependents only once.

```typescript
batch(() => {
  x.value = 1;
  y.value = 2;
  z.value = 3;
});
```

### `untracked<T>(fn: () => T): T`

Runs a function without tracking dependencies.

```typescript
const value = untracked(() => count.value);
```

### `reactiveObject<T>(obj: T, options?: ReactiveOptions): Signalify<T>`

Creates a deeply reactive object where properties are transformed into signals, with support for selective reactivity through path patterns.

```typescript
const user = reactiveObject({
  name: 'John',
  details: {
    age: 30,
    addresses: [{city: 'New York'}, {city: 'Boston'}]
  }
});

// Access and update properties
console.log(user.name.value); // "John"
user.details.value.age.value = 31;
```

#### ReactiveOptions

```typescript
interface ReactiveOptions {
  callback?: (path: (string | number)[], value: unknown) => void;
  path?: (string | number)[];
  trackPatterns?: string[];
}
```

### `watch<T>(signal: Signal<T>, callback: (value: T, prev: T | undefined) => void): () => void`

Watches a signal for changes and calls the callback with new and previous values.

```typescript
const unwatch = watch(count, (newValue, oldValue) => {
  console.log(`Value changed from ${oldValue} to ${newValue}`);
});

// Later, stop watching
unwatch();
```

### `safeExecute<T>(fn: () => T, errorHandler?: (error: unknown) => void): T | undefined`

Safely executes a function with error handling to prevent errors from disrupting the reactive system.

```typescript
const result = safeExecute(
  () => JSON.parse(jsonString.value),
  (error) => console.error('Failed to parse JSON:', error)
);
```

### `monitorSignals(enable: boolean): void`

Enables signal monitoring for debugging (development only).

```typescript
// Enable monitoring in dev mode
if (process.env.NODE_ENV === 'development') {
  monitorSignals(true);
}
```

## Advanced Usage

### Handling Cleanup in Effects

```typescript
const dispose = effect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  fetch(`/api/user/${userId.value}`, { signal })
    .then(res => res.json())
    .then(data => console.log(data));

  // Return cleanup function
  return () => controller.abort();
});
```

### Creating Dependent Computed Signals

```typescript
const x = signal(5);
const y = signal(10);

const sum = computed(() => x.value + y.value);
const doubled = computed(() => sum.value * 2);
```

### Signal Subscription

```typescript
const unsubscribe = count.subscribe((value) => {
  console.log(`Count changed to: ${value}`);
});

// Later, unsubscribe
unsubscribe();
```

### Accessing Signal Values Without Tracking

```typescript
// Using peek method
const currentValue = count.peek();

// Using untracked utility
const result = untracked(() => {
  return count.value * 2;
});
```


# WARNING!!!
 - The following part of the documentation related to reactive objects is experimental, currently being tested but not used in production.

## Path-Based Reactivity

The library supports path-based reactivity with glob patterns for selective tracking of nested data structures.

### Basic Path Tracking

```typescript
const userData = reactiveObject({
  profile: {
    name: 'John',
    details: {
      age: 30,
      address: {
        city: 'New York',
        zip: '10001'
      }
    }
  },
  preferences: {
    theme: 'dark',
    notifications: true
  }
}, {
  // Track changes to any value in the object
  trackPatterns: ['**'],
  callback: (path, value) => {
    console.log(`Value changed at path ${path.join('.')}: ${value}`);
  }
});
```

### Selective Path Tracking

```typescript
const state = reactiveObject({
  user: {
    profile: { name: 'John', age: 30 },
    settings: { theme: 'dark', notifications: true }
  },
  cart: {
    items: [
      { id: 1, name: 'Product 1', price: 9.99 },
      { id: 2, name: 'Product 2', price: 19.99 }
    ],
    total: 29.98
  }
}, {
  // Only track changes to certain paths
  trackPatterns: [
    'user.profile.*',    // Track all profile properties
    'cart.items.*.price' // Track all item prices
  ],
  callback: (path, value) => {
    console.log(`[${path.join('.')}] = ${value}`);
  }
});
```

## Performance Considerations

1. **Batch Updates**: Use `batch()` when updating multiple signals at once to reduce unnecessary recalculations.

2. **Untracked Access**: Use `untracked()` or `peek()` to access signal values without creating dependencies when appropriate.

3. **Dispose Effects**: Always dispose effects when they're no longer needed to prevent memory leaks.

4. **Granular Signals**: Create smaller, more focused signals instead of large monolithic ones for better performance.

5. **Avoid Unnecessary Computations**: Don't create computed signals inside effects or other computed signals.

6. **Node Pooling**: The library uses internal node pooling for memory efficiency, with a default pool size of 1000 nodes.

7. **Selective Reactivity**: Use path patterns to track only the parts of your data that need reactivity.

## Error Handling

### Error Propagation in Computed Signals

Computed signals automatically propagate errors to their dependents:

```typescript
const jsonData = signal('{"name": "John"}');
const parsedData = computed(() => JSON.parse(jsonData.value));

// If JSON becomes invalid, this will throw the parsing error
try {
  console.log(parsedData.value);
} catch (error) {
  console.error('Error in computed signal:', error);
}
```

### Error Handling in Effects

```typescript
effect(() => {
  try {
    const data = parsedData.value;
    console.log('Processed data:', data);
  } catch (error) {
    console.error('Failed to process data:', error);
  }
});
```

### Safe Execution

```typescript
const processData = () => {
  safeExecute(() => {
    const data = parsedData.value;
    // Process data safely
  }, (error) => {
    // Handle error gracefully
    console.error('Error processing data:', error);
  });
};
```

## Best Practices

### Signal Creation and Naming

- Place signals at the top level of modules or components
- Use noun-based names for signals (e.g., `count`, `userName`)
- Use verb or adjective prefixes for computed signals (e.g., `isValid`, `formattedDate`)

### Effect Management

- Keep effects focused on a single responsibility
- Always return cleanup functions when necessary
- Dispose effects when they're no longer needed

### Error Handling

- Use `safeExecute()` for error-prone operations
- Handle errors gracefully in computed signals and effects
- Avoid throwing errors in effect cleanup functions

### Dependency Tracking

- Be aware of what creates dependencies (accessing `.value`)
- Use `peek()` or `untracked()` when you need to access a value without creating a dependency
- Avoid deep nesting of computed signals to prevent unnecessary recalculations

### Batching

- Batch updates that should happen simultaneously
- Use batch for initialization code that updates multiple signals
- Consider batching in event handlers that update multiple values

### Reactive Objects

- Use selective tracking with path patterns for large objects
- Create smaller reactive objects rather than one large state object
- Be aware of array indexing in path patterns

## Implementation Details

The signals library uses a dependency graph to track relationships between signals and their dependents. Key implementation features include:

1. **Node Pooling**: Reduces memory pressure by reusing node objects (pool size: 1000)
2. **Batched Updates**: Efficiently processes multiple updates in a single cycle (max iterations: 1000)
3. **Cycle Detection**: Prevents infinite loops in dependencies
4. **Lazy Evaluation**: Computed signals only recalculate when accessed
5. **Garbage Collection**: Allows unused computed signals to be garbage collected
6. **Version Tracking**: Uses version numbers to efficiently detect changes (with MAX_INT32 rollover protection)
7. **Recursion Limits**: Enforces maximum recursion depth (100) to prevent stack overflows
8. **SignalNode Linked Lists**: Maintains bidirectional links between signals and their dependents

### Internal Signal Flags

The library uses bit flags to track signal states:
- RUNNING (1): Signal is currently being evaluated
- NOTIFIED (2): Signal has been notified of a change
- OUTDATED (4): Signal's value is outdated
- DISPOSED (8): Signal has been disposed
- HAS_ERROR (16): Signal evaluation produced an error
- TRACKING (32): Signal is tracking dependencies

## Troubleshooting

### Common Issues

#### Infinite Loops

```
Error: Cycle detected in signal updates
```

This error occurs when signals form a circular dependency. Check your signal dependencies to ensure there are no cycles.

#### Maximum Recursion Depth

```
Error: Maximum recursion depth exceeded (100). Possible infinite recursion detected.
```

This happens when signal updates trigger too many nested updates. Review your signal dependencies and ensure effects aren't causing excessive updates.

#### Maximum Batch Iterations

```
Error: Maximum batch iteration limit reached (1000). Possible infinite loop detected.
```

This occurs when signal updates cause too many batched operations. Check for signals continuously updating each other in a loop.

#### Missing Dependencies

If an effect or computed signal isn't updating when expected, make sure all dependencies are accessed via `.value` within the callback function.

#### Memory Leaks

If your application is using excessive memory, ensure all effects are being properly disposed when no longer needed.

### Debugging Tips

1. Use `monitorSignals(true)` during development to track signal updates
2. Use `watch()` to observe specific signals for debugging
3. Break complex computed signals into smaller, more manageable pieces
4. Test signal graphs with different input variations
5. Check for disposed effects that are still holding references

## License

MIT
