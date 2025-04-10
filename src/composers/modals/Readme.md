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

In `registry.ts`:

```tsx
import { lazy } from "react";

const CalendarModal = lazy(() => import("./modal-calendar"));
const LinkPreviewModal = lazy(() => import("./modal-link-preview"));
const MembersViewModal = lazy(() => import("./modal-members-list"));

// NEW
const SettignsModal = lazy(() => import("./modal-settigns"));

const modalRegistry = {
  calendar: CalendarModal,
  "link-preview": LinkPreviewModal,
  "members-view": MembersViewModal,
  "settings": SettignsModal
} as const;

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


---

## ✅ Future Improvements
- Modal stacking
- Escape key support
- Per-modal animations

## 📃 Registry (`registered.ts`)
Auto-generated via `import.meta.glob("./modal-*/index.tsx")`. Example output:
```typescript
{
  "calendar": LazyComponent,
  "link-preview": LazyComponent,
  "members-list": LazyComponent
}
```
## 🧪 But there is a temporary problem that occurs with such an import, it is not possible to extract props, for now :)

---

## 👨‍💻 Contributing
- Follow type-safe patterns.
- Maintain `modal-` prefix naming.
- Test with `useModalComposerAPI`.

---

## 📄 License
MIT
