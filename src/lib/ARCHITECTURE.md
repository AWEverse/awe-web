
# 🏛 Project Architecture Deep Dive

> Detailed explanation of our `lib/` internal structure, dependency mapping, and practical usage.

---

## 📜 Conceptual Layers

### 1. Core
- **Purpose:** Foundation layer, providing basic algorithms, math, data structures.
- **Examples:** `binarySearch.ts`, `findSequence.ts`, `unique.ts`
- **Rules:** Must have no side-effects. No I/O, no timers, no system access.

---

### 2. Utils
- **Purpose:** Extend `core/` with ready-to-use helper functions.
- **Examples:** `areDeepEqual.ts`, `captureEvents.ts`, `trapFocus.ts`
- **Rules:** May combine multiple `core/` utilities but should stay independent of domain/infrastructure.

---

### 3. Domain
- **Purpose:** Represents business concepts and logic.
- **Examples:** `models/`, `modules/`, `settings/`
- **Rules:** Can use `core/` and `utils/`, but **must not** import system adapters or OS logic.

---

### 4. Infra
- **Purpose:** Handles real-world interactions (file system, network, OS APIs).
- **Examples:** `storage/`, `logging/`, `os/`
- **Rules:** Pure system boundaries. Must hide third-party libraries behind abstraction.

---

### 5. Shared
- **Purpose:** Share constants, enums, types.
- **Examples:** `animation/constants.ts`, `mimeTypes.ts`
- **Rules:** No executable logic inside. Only declarations.

---

### 6. Config
- **Purpose:** Centralize static configuration for easy access and adjustment.
- **Examples:** `projectSettings.ts`, `envSettings.ts`
- **Rules:** Must be read-only.

---

## 🔄 Mapping Allowed Dependencies

| From Layer | Can Depend On | Must Not Depend On |
|:-----------|:--------------|:-------------------|
| core | - | utils, domain, infra |
| utils | core | domain, infra |
| domain | core, utils | infra |
| infra | core, utils, domain | - |
| shared | - | - |
| config | - | - |

---

## 🚀 Practical Example

When writing a new feature:

- If it’s a pure algorithm → goes to `core/`
- If it combines algorithms for easier use → goes to `utils/`
- If it models business data (e.g., User, Session) → goes to `domain/`
- If it integrates with the system (e.g., saving to disk) → goes to `infra/`
- If it’s a constant like MIME types → goes to `shared/`
- If it's an env or project setting → goes to `config/`

---

## 🛠 Best Practices

- Prefer composition over inheritance.
- Encapsulate complexity: expose clean public APIs (index.ts).
- Follow strict dependency direction.
- Keep layers thin and focused.
- Document each module's responsibility.

---

# 🧠 Final Notes

Maintaining strict project structure is **critical** for:

- Long-term scalability
- Easier onboarding of new developers
- Lower technical debt
- Faster delivery cycles


# 🎯 Our Goal

> **A clean, scalable, maintainable codebase built for the future.**
