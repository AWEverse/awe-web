# PathMatcher DSL — Advanced Pattern Matching for Object Paths

A robust, efficient, and extensible Domain-Specific Language (DSL) for path-based pattern matching in deeply nested JavaScript/TypeScript structures.

---

## ✨ Features Overview

| Pattern          | Description                                            |
|------------------|--------------------------------------------------------|
| `*`              | Matches any **string** key at one level                |
| `[]`             | Matches any **array index** (numeric)                  |
| `**`             | Matches **zero or more** nested path segments          |
| `:param`         | Captures a segment as a named parameter                |
| `:param:type`    | Captures segment with **type constraint** (`string`, `number`, `boolean`) |
| `**:param`       | Captures remaining path segments as a **deep parameter** |
| `(opt1|opt2)`    | Group pattern that matches **any of the options**      |
| `` `key.${var}` `` | **Template segment** with interpolation support      |

---

## 🧠 Syntax Breakdown

### Segment Types

| Syntax              | Type         | Description                                         |
|---------------------|--------------|-----------------------------------------------------|
| `user`              | Identifier   | Standard object key (must be valid JS identifier)   |
| `*`                 | Wildcard     | Matches any string key                              |
| `[]`                | Array Index  | Matches numeric array indexes                       |
| `**`                | Deep Wildcard | Matches any nested sequence of keys                |
| `:name`             | Named Param  | Captures single segment into `params.name`          |
| `:name:string`      | Typed Param  | Like `:name`, but validates type (`string`, `number`, `boolean`) |
| `**:rest`           | Deep Param   | Captures all remaining segments into `params.rest` as array |
| `(a|b|c)`           | Option Group | Matches one of several predefined string values     |
| `` `id.${type}` ``  | Template     | Supports variable interpolation                     |

---

## 🧪 Usage Example

```ts
import { createPathMatcherWithTrace } from 'PathMatcherDSL';

const matcher = createPathMatcherWithTrace([
  'user.*.name',
  'user.:section.name',
  'root.**:path',
  'logs.(:info|warn|error)',
  'files.[]:index:number.name',
]);

const path = ['files', 2, 'name'];
const result = matcher(path);

console.log(result);
```

### Output:
```ts
[
  { pattern: 'user.*.name', matched: false },
  { pattern: 'user.:section.name', matched: false },
  { pattern: 'root.**:path', matched: false },
  { pattern: 'logs.(:info|warn|error)', matched: false },
  {
    pattern: 'files.[]:index:number.name',
    matched: true,
    params: { index: '2' }
  }
]
```

---

## 🔍 Advanced Examples

### ✅ Deep Parameter Capture
```ts
// pattern: 'root.**:tail'
matchPath(['root', 'a', 'b', 'c'], pattern)
// ➜ { matched: true, params: { tail: ['a', 'b', 'c'] } }
```

### ✅ Typed Parameters
```ts
// pattern: 'file.:id:number'
matchPath(['file', 42], pattern)
// ➜ matched, id: "42"

matchPath(['file', 'abc'], pattern)
// ➜ ❌ invalid (not a number)
```

### ✅ Group Matching
```ts
// pattern: 'status.(ok|fail|warn)'
matchPath(['status', 'fail'], pattern)
// ➜ matched
```

### ❌ Invalid Identifiers
```ts
parsePathPattern('foo.@bar')
// ➜ throws PathSyntaxError: Invalid path segment "@bar"
```

---

## 🔧 Developer API

### `parsePathPattern(input: string): PathToken[]`
- Parses a pattern string into tokens.
- Throws `PathSyntaxError` on failure.

### `createPathMatcher(patterns: string[]): (path: PathSegment[]) => boolean`
- Returns a function that tests whether any pattern matches a given path.

### `createPathMatcherWithTrace(patterns: string[]): (path: PathSegment[]) => MatchTrace[]`
- Returns a function that provides **diagnostics** for all patterns:
```ts
type MatchTrace = {
  pattern: string;
  matched: boolean;
  params?: Record<string, string>;
};
```

---

## 🧩 Param Typing

Typed parameters allow simple runtime constraints:

| Type     | Description                   |
|----------|-------------------------------|
| `string` | Segment must be a string key  |
| `number` | Segment must be numeric       |
| `boolean`| Segment must be `'true'` or `'false'` |

Custom types and extensions are possible via plugin architecture (see roadmap).

---

## 🧼 Error Handling

- `PathSyntaxError` includes invalid segment and position.
- Examples:
  - Empty segment: `"foo..bar"` → error at index 1
  - Invalid identifier: `"foo.@bar"` → error at index 1

---

## 🎯 Design Goals

- ✅ Zero allocations during matching
- ✅ Precompiled and cached patterns
- ✅ Traceable and testable
- ✅ Works with deeply nested object paths
- ✅ Plug-and-play syntax extensions

---

## 🛤 Roadmap

| Feature                                | Status   |
|----------------------------------------|----------|
| Type-safe param inference              | 🔜 Planned |
| Integration with JSON Schema           | 🔜 Planned |
| Plugin-based pattern validation        | 🧪 Prototype |
| Browser visual DSL editor              | 🔜 Planned |
| Runtime param validators               | 🧪 Prototype |
| Recursive path flattening              | ✅ Done |

---

## 📈 Performance

- Compiled matcher avoids allocations in hot paths
- LRU-style cache for parsed patterns
- Suitable for reactive systems, object observers, UI trees, etc.

---

## 📄 License

MIT — Open for contributions and extensions.

---
