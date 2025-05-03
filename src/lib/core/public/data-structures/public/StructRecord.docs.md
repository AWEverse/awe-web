# StructRecord Documentation

## Overview

`StructRecord` is a TypeScript utility for creating **type-safe records** with support for both **mutable and immutable** data structures. It enforces strict type validation, prevents side effects, and provides functional-style updates while maintaining compatibility with JavaScript's native object manipulation.

Inspired by the design of [metautil/record.js](https://github.com/metarhia/metautil/blob/record/lib/record.js), this implementation ensures:

- ✅ Type consistency at runtime
- ✅ Immutable-by-default behavior
- ✅ Explicit mutation support for mutable records
- ✅ Safe property access with prototype-free objects
- ✅ Clean separation between instance creation and updates

---

## Installation (in future)

```bash
npm install struct-record
```

Or include directly from source:

```ts
import StructRecord, { type RecordConstructor } from './StructRecord';
```

---

## API Reference

### Types

#### `Primitive`
```ts
type Primitive = null | boolean | number | string;
```

#### `ValidValue`
```ts
type ValidValue = Primitive | any[] | Record<string, any>;
```

#### `RecordConstructor<T>`
```ts
interface RecordConstructor<T> {
  new(): T;
  fields: string[];
  defaults: T;
  mutable: boolean;
  create(data?: Partial<T>): Readonly<T>;
}
```

---

### Static Methods

#### `StructRecord.immutable<T>(defaults: T): RecordConstructor<T>`
Creates an immutable record class where instances are frozen by default.

#### `StructRecord.mutable<T>(defaults: T): RecordConstructor<T>`
Creates a mutable record class where instances are sealed but not frozen.

#### `StructRecord.update<T>(instance: T, updates: Partial<T>): T`
Mutates a **mutable** record instance with validated updates.

#### `StructRecord.fork<T>(instance: T, updates: Partial<T>): Readonly<T>`
Returns a **new frozen object** based on `instance`, with updated values.

#### `StructRecord.branch<T>(instance: T, updates: Partial<T>): T`
Returns a **new object** inheriting from `instance`, with overridden properties.

---

## Usage Examples

### 1. Define a Record Type

```ts
const User = StructRecord.mutable({
  name: 'Alice',
  age: 30,
  tags: ['user'],
});
```

### 2. Create an Instance

```ts
const user = User.create();
console.log(user.name); // "Alice"
console.log(user.age);  // 30
console.log(user.tags); // ["user"]
```

### 3. Mutate a Mutable Record

```ts
StructRecord.update(user, { age: 31 });
console.log(user.age); // 31
```

### 4. Fork an Immutable Copy

```ts
const updatedUser = StructRecord.fork(user, { name: 'Bob' });
console.log(updatedUser.name); // "Bob"
console.log(user.name);        // "Alice"
```

### 5. Branch from an Instance

```ts
const child = StructRecord.branch(user, { age: 40 });
console.log(child.age);         // 40
console.log((child as any).__proto__); // user
```

---

## Core Concepts

### Type Safety

All values are validated against their default types using:

```ts
StructRecord.#sameType(a: ValidValue, b: ValidValue): boolean
```

This ensures:

- Arrays stay arrays
- Objects stay objects
- Primitives stay primitive
- Null stays null

#### Example

```ts
const User = StructRecord.immutable({ age: 30 });
User.create({ age: 'thirty' }); // ❌ TypeError
```

---

### Immutability

Immutable records are created using `Object.freeze()`. Attempts to mutate them will throw:

```ts
const user = User.create();
StructRecord.update(user, { age: 31 }); // ❌ Error: Cannot mutate immutable Record
```

---

### Mutation Support

Only sealed (mutable) records can be updated:

```ts
const MutableUser = StructRecord.mutable({ name: 'Alice' });
const user = MutableUser.create();
StructRecord.update(user, { name: 'Bob' }); // ✅ Works
```

---

### Forking vs Branching

| Method | Behavior | Use Case |
|-------|----------|----------|
| `fork()` | Returns a new frozen object | Copy-on-write updates |
| `branch()` | Returns a new object with prototype inheritance | Prototype-based overrides |

---

## Internal Mechanics

### Record Creation

Records are created using `Object.create(null)` to avoid prototype pollution.

```ts
const obj = Object.create(null);
```

### Type Validation

Validation is performed using:

```ts
StructRecord.#typeof(value: ValidValue): string
```

Which returns:
- `"array"` for arrays
- `"null"` for nulls
- `"object"` for objects
- `"string"`, `"number"`, `"boolean"` otherwise

---

### Property Updates

When updating, StructRecord ensures:
1. The key exists in the original record
2. The new value has the same type as the original
3. The update is applied safely

---

## Best Practices

### ✅ Always Validate Input

Use `StructRecord.immutable()` or `.mutable()` to enforce strict defaults.

### ✅ Prefer `fork()` for Immutable Updates

Avoid side effects by always returning a new object:

```ts
const newUser = StructRecord.fork(oldUser, { name: 'Updated' });
```

### ✅ Use `branch()` for Prototype Inheritance

Ideal for scenarios where you want to override some properties but inherit others.

### ❌ Don't Mutate Immutable Records

Always check `record.constructor.mutable` before calling `update()`.

---

## Common Errors

### ❌ TypeError: Invalid type

```ts
const User = StructRecord.immutable({ age: 30 });
User.create({ age: 'thirty' });
// Error: Invalid type for "age": expected number, got string
```

### ❌ Error: Cannot mutate immutable Record

```ts
const user = StructRecord.immutable({ name: 'Alice' }).create();
StructRecord.update(user, { name: 'Bob' });
// Error: Cannot mutate immutable Record
```

---

## Design Philosophy

StructRecord follows these principles:

- **Immutability First**: Default behavior is to freeze records
- **Explicit Mutations**: Only allowed on mutable records
- **Type Consistency**: Values must match default types
- **Functional Updates**: `fork()` and `branch()` return new objects
- **No Prototype Pollution**: Uses `Object.create(null)`

---

## License

MIT License

---

## See Also

- [metautil/record.js](https://github.com/metarhia/metautil/blob/record/lib/record.js)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/)

---

This documentation covers all aspects of `StructRecord`, including its API, usage patterns, internal mechanics, and design decisions. It serves as a complete reference for developers integrating or extending the library.
