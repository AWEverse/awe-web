
# 📚 lib/ Layered Architecture Documentation

> This document describes the structure, rules, and best practices for working with the `lib/` folder.
> It is intended to **standardize development**, **prevent cyclic dependencies**, and **enable scalable growth**.

---

## 📐 Project Structure

```mermaid
flowchart TD
  core((core))
  utils((utils))
  domain((domain))
  infra((infra))
  config((config))
  shared((shared))

  core --> utils
  utils --> domain
  domain --> infra
  config -.-> core
  config -.-> utils
  config -.-> domain
  config -.-> infra
  shared -.-> core
  shared -.-> utils
  shared -.-> domain
  shared -.-> infra
```

---

## 🏗 Layer Responsibilities

| Layer | Responsibility | Allowed Dependencies |
|:-----|:----------------|:----------------------|
| **core/** | Basic, low-level primitives and pure logic | None |
| **utils/** | Helper functions built on top of core | core |
| **domain/** | Business entities, domain logic | utils, core |
| **infra/** | Environment-related services (OS, storage, cache) | domain, utils, core |
| **config/** | Static project configurations | Referenced only |
| **shared/** | Common constants and types | Referenced only |

... (сокращено ради компактности)
