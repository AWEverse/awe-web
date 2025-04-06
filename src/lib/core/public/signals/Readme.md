# Reactive Signals Library

A lightweight, efficient reactive programming library that provides fine-grained reactivity through signals. This library enables automatic dependency tracking and updates when data changes, making it easy to build reactive applications.

## Table of Contents

- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Performance Considerations](#performance-considerations)
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

### `reactiveObject<T>(obj: T): ISignalObject<T>`

Creates a reactive object where each property is a signal.

```typescript
const user = reactiveObject({
  name: 'John',
  age: 30
});

// Access and update properties
console.log(user.name.value); // "John"
user.age.value = 31;
```

### Additional Utility Functions

- `watch<T>(signal: Signal<T>, callback: (value: T, prev: T) => void): () => void`: Watches a signal for changes
- `safeExecute<T>(fn: () => T, errorHandler?: (error: unknown) => void): T | undefined`: Safely executes a function with error handling
- `monitorSignals(enable: boolean): void`: Enables signal monitoring for debugging (development only)

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

### Managing Side Effects

```typescript
// Use batch for better performance when updating multiple values
function updateUserData(userData) {
  batch(() => {
    user.name.value = userData.name;
    user.email.value = userData.email;
    user.age.value = userData.age;
  });
}
```

## Performance Considerations

1. **Batch Updates**: Use `batch()` when updating multiple signals at once to reduce unnecessary recalculations.

2. **Untracked Access**: Use `untracked()` or `peek()` to access signal values without creating dependencies when appropriate.

3. **Dispose Effects**: Always dispose effects when they're no longer needed to prevent memory leaks.

4. **Granular Signals**: Create smaller, more focused signals instead of large monolithic ones for better performance.

5. **Avoid Unnecessary Computations**: Don't create computed signals inside effects or other computed signals.

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

## Implementation Details

The signals library uses a dependency graph to track relationships between signals and their dependents. Key implementation features include:

1. **Node Pooling**: Reduces memory pressure by reusing node objects
2. **Batched Updates**: Efficiently processes multiple updates in a single cycle
3. **Cycle Detection**: Prevents infinite loops in dependencies
4. **Lazy Evaluation**: Computed signals only recalculate when accessed
5. **Garbage Collection**: Allows unused computed signals to be garbage collected

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

#### Missing Dependencies

If an effect or computed signal isn't updating when expected, make sure all dependencies are accessed via `.value` within the callback function.

#### Memory Leaks

If your application is using excessive memory, ensure all effects are being properly disposed when no longer needed.

### Debugging Tips

1. Use `monitorSignals(true)` during development to track signal updates
2. Use `watch()` to observe specific signals for debugging
3. Break complex computed signals into smaller, more manageable pieces
4. Test signal graphs with different input variations

## License

MIT
