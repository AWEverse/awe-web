# PathMatcher DSL with Parameters and Tracing

A powerful and extensible DSL for matching object paths using glob-like patterns. Supports:

- Wildcards (`*`, `[]`, `**`)
- Named parameters (`:param`)
- Structural validation
- Match tracing and parameter extraction


---

## ✨ Features

| Pattern      | Description                                 |
|--------------|---------------------------------------------|
| `*`          | Matches any string key at one level          |
| `[]`         | Matches any array index (number)             |
| `**`         | Matches zero or more nested segments         |
| `:param`     | Captures a named segment as parameter        |
| `user.*.id`  | Matches any property under `user` with `id` |
| `user.:role.name` | Matches like `user.admin.name`, captures `role=admin` |

---

## 🧠 Syntax

### Segment Types
| Type           | Example       | Description                           |
|----------------|---------------|---------------------------------------|
| Identifier     | `foo`, `user` | Regular object key                    |
| Wildcard       | `*`           | Matches any single string key         |
| ArrayWildcard  | `[]`          | Matches any numeric index             |
| DeepWildcard   | `**`          | Matches zero or more nested segments  |
| NamedParam     | `:name`       | Captures matching segment as param    |

---

## 🧪 Usage

```ts
import { createPathMatcherWithTrace } from 'PathMatcherDSL';

const matcher = createPathMatcherWithTrace([
  'user.*.name',
  'user.:section.name',
  'root.**.b[]',
]);

const path = ['user', 'admin', 'name'];
const result = matcher(path);

console.log(result);
```

### Output:
```ts
[
  {
    pattern: 'user.*.name',
    matched: true,
    params: {}
  },
  {
    pattern: 'user.:section.name',
    matched: true,
    params: { section: 'admin' }
  },
  {
    pattern: 'root.**.b[]',
    matched: false,
    params: {}
  }
]
```

---

## 🔍 Examples

### Example 1: Deep wildcard
```ts
matchPath(['a', 'b', 'c'], ['a', '**']) // ✅ true
```

### Example 2: Parameter matching
```ts
matchPath(['user', 'manager', 'name'], ['user', ':section', 'name'])
// returns { matched: true, params: { section: 'manager' } }
```

### Example 3: Invalid pattern
```ts
parsePathPattern('user.@name')
// throws PathSyntaxError: Invalid path segment "@name" at index 1
```

---

## 🛠 Developer API

### `parsePathPattern(input: string): PathToken[]`
Parses and validates a single pattern.

### `createPathMatcher(patterns: string[]): (path: PathSegment[]) => boolean`
Creates a matcher function for boolean matching.

### `createPathMatcherWithTrace(patterns: string[]): (path: PathSegment[]) => MatchResult[]`
Returns full match diagnostics with parameters:
```ts
interface MatchResult {
  pattern: string;
  matched: boolean;
  params: Record<string, string>;
}
```

### Error Handling
- Throws `PathSyntaxError` for invalid identifiers.

---

## 📊 Visualization (Conceptual)

```txt
Pattern:      user.:section.name
Input path:   ["user", "admin", "name"]

[user]      → matches "user"
[:section]  → captures "admin"
[name]      → matches "name"
```

---

## 📎 Notes
- Patterns are matched left to right.
- `**` can consume any number of segments including zero.
- Named parameters must be valid JS identifiers.

---

## 🚧 Roadmap
- [ ] Type-safe bindings between patterns and extracted params
- [ ] JSON Schema integration
- [ ] Path visual editor with autocomplete

---

## 📄 License
MIT
