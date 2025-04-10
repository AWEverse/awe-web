# 🧩 Modal Composer System

A **type-safe, lazy-loaded modal manager** built with `React.lazy`, `Suspense`, and `Context API`. Scalable, efficient, and developer-friendly.

---

## 📦 Features
- Centralized modal registry
- Lazy-loaded modal components
- Strict TypeScript prop typing
- Reusable modal API
- Custom `zIndex` support

---

## 🗂 Directory Structure
```
src/composers/
├── index.ts
└── modals/
    ├── index.ts              # Modal exports
    ├── ModalComposer.tsx     # Modal provider
    ├── Readme.md             # This doc
    ├── registered.ts         # Modal registry
    ├── utils/                # Modal utilities
    ├── modal-calendar/       # Calendar modal
    ├── modal-link-preview/   # Link preview modal
    └── modal-members-list/   # Members list modal
```

---

## 📘 Usage

### 1. Setup Provider
In `App.tsx`:
```tsx
import { ModalComposerProvider } from "@/composers/modals/ModalComposer";

export default function App() {
  return (
    <ModalComposerProvider>
      {/* App content */}
    </ModalComposerProvider>
  );
}
```

### 2. Open Modals
Using the hook:
```tsx
import { useModalComposerAPI } from "@/composers/modals/ModalComposer";

const { openModal, closeModal } = useModalComposerAPI();

// Open calendar modal and the props automaticaly load by TypeScript
openModal("calendar", { date: "2025-04-10" });
```

---

## 🧪 Adding a Modal
1. Create a folder under `src/composers/modals/` with prefix `modal-` (e.g., `modal-new-feature/`).
2. Add an `index.tsx` exporting a default `React.ComponentType` with `onClose` prop.
3. Done! `import.meta.glob` auto-registers it.

## 📃Note:
> In the new modal component, you can add only **the content** you want, as it is globally defined as a single modal component.

Example:
```tsx
// src/composers/modals/modal-new-feature/index.tsx
import React from "react";

interface Props {
  onClose: () => void;
  data: string;
}

const NewFeatureModal: React.FC<Props> = ({ data, onClose }) => (
  <div>
    <h2>{data}</h2>
    <button onClick={onClose}>Close</button>
  </div>
);

export default NewFeatureModal;
```

---

## 🧼 Modal Requirements
- Must accept `onClose: () => void`.
- Must be default export.
- Use `React.FC<Props>` for type inference.

---

## 📌 Tips
- Modals are auto-wrapped in a UI shell—avoid redundant styling.
- `onClose` is injected; don’t pass it manually in `openModal`.
- Check `registered.ts` for the generated registry.

---

## 📃 Registry (`registered.ts`)
Auto-generated via `import.meta.glob("./modal-*/index.tsx")`. Example output:
```typescript
{
  "calendar": LazyComponent,
  "link-preview": LazyComponent,
  "members-list": LazyComponent
}
```

---

## ✅ Future Improvements
- Modal stacking
- Escape key support
- Per-modal animations

---

## 👨‍💻 Contributing
- Follow type-safe patterns.
- Maintain `modal-` prefix naming.
- Test with `useModalComposerAPI`.

---

## 📄 License
MIT
