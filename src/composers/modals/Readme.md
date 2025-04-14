# 🧩 Modal Composer System

A **type-safe, lazy-loaded modal manager** built with `React.lazy`, `Suspense`, and `Context API`. Scalable, efficient, and developer-friendly.

---

## 📦 Features
- Centralized, dynamically generated modal registry
- Lazy-loaded modal components for performance
- Strict TypeScript typing with prop inference
- Simple, reusable modal API

---

## 🗂 Directory Structure
```
src/composers/
├── index.ts
└── modals/
    ├── index.ts              # Modal exports
    ├── ModalComposer.tsx     # Modal provider
    ├── Readme.md             # This doc
    ├── registered.ts         # Dynamic modal registry
    ├── utils/                # Modal utilities
    ├── modal-calendar/       # Calendar modal
    ├── modal-link-preview/   # Link preview modal
    └── modal-members-list/   # Members list modal
```

---

## 📘 Usage

### 1. Setup Provider
Wrap your app with the `ModalComposerProvider` in `App.tsx`:
```tsx
import { ModalComposerProvider } from "@/composers/modals/ModalComposer";

export default function App() {
  return (
    <ModalComposerProvider>
      {/* Your app content */}
    </ModalComposerProvider>
  );
}
```

### 2. Open Modals
Use the `useModalComposerAPI` hook to open modals with type-safe props:
```tsx
import { useModalComposerAPI } from "@/composers/modals/ModalComposer";

const { openModal, closeModal } = useModalComposerAPI();

// Open a modal with auto-typed props
openModal("calendar", { date: "2025-04-10", onClose: () => {} });
openModal("link-preview", { url: "https://example.com", onClose: () => {} });
```

---

## 🧪 Adding a Modal

1. Create a new modal component (e.g., `modal-settings/index.tsx`):
```tsx
import React from "react";

type Props = { settingId: string } & ModalCommonProps;

const SettingsModal: React.FC<Props> = ({ settingId, onClose }) => (
  <div>
    <h1>Settings: {settingId}</h1>
    <button onClick={onClose}>Close</button>
  </div>
);

export default SettingsModal;
```

2. Add it to `registered.ts`:
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
- Must accept `onClose: () => void` as a prop.
- Must be the default export of its module.
- Use `React.FC<Props>` for automatic prop type inference.

---

## 📌 Tips
- Modals are wrapped in a UI shell—avoid redundant styling.
- `onClose` is automatically provided; don’t pass it manually in `openModal`.
- Check `registered.ts` for the current modal registry.

---

## ✅ Future Improvements
- Modal stacking with dynamic `zIndex`
- Escape key support for closing modals
- Custom animations per modal type
- Dynamic prop extraction from lazy imports (WIP)

---

## 📃 Registry (`registered.ts`)
The registry is dynamically generated from `modalDefinitions`. Example output:
```typescript
{
  "calendar": LazyComponent,
  "link-preview": LazyComponent,
  "members-view": LazyComponent,
  "settings": LazyComponent
}
```
**Note**: Prop extraction from lazy imports is a known limitation and being explored.

---

## 👨‍💻 Contributing
- Follow type-safe patterns and conventions.
- Use the `modal-` prefix for modal directories.
- Test with `useModalComposerAPI` in a dev environment.

---

## 📄 License
MIT

