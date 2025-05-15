## 🧠 Markdown Web Worker

> High-performance, extensible Markdown rendering engine with safe HTML output, mentions, tags, emojis — all inside a WebWorker.

---

### 🚀 Features

- ✅ **MarkdownIt-based** parser (GitHub-flavored, safe)
- 🧩 **Custom extensions** (`@mentions`, `#tags`, `:emoji:`)
- 🧼 **Strict sanitization** with `sanitize-html`
- 🧵 **Batch & single rendering** support
- ⚡ **Offloaded to WebWorker** — main thread stays fast
- 📊 **Diagnostics mode** (parse time, length)

---

### 📦 Installation

This module is intended to run inside a **WebWorker** context.

You can either:

1. **Bundle with Vite / esbuild**:

   ```ts
   // vite.config.ts
   worker: {
     format: 'es',
     plugins: [webWorkerLoader()],
   }
   ```

2. **Use native import in browser** (with `type="module"`):

   ```ts
   const worker = new Worker(new URL("./markdown.worker.ts", import.meta.url), {
     type: "module",
   });
   ```

---

### 🛠 Usage

#### ➤ Single Markdown render:

```ts
worker.postMessage({
  id: "req-1",
  markdownText: "**Hello** @user :smile:",
});
```

Returns:

```ts
{
  id: "req-1",
  html: "<p><strong>Hello</strong> <span class=\"md-mention\" data-mention=\"user\">@user</span> <span class=\"md-emoji\" data-emoji=\"smile\">:smile:</span></p>"
}
```

#### ➤ Batch render:

```ts
worker.postMessage({
  messages: [
    { id: "m1", markdownText: "**Hello**" },
    { id: "m2", markdownText: "*italic*" },
  ],
});
```

Returns:

```ts
{
  batch: [
    { id: "m1", html: "<p><strong>Hello</strong></p>" },
    { id: "m2", html: "<p><em>italic</em></p>" },
  ];
}
```

---

### 🔌 Extensions

You can inject custom MarkdownIt plugins via the `config.extensions` array:

```ts
worker.postMessage({
  id: "custom",
  markdownText: "!!custom",
  config: {
    extensions: [
      (md) => {
        md.inline.ruler.before("emphasis", "doubleBang", (state, silent) => {
          const match = state.src.slice(state.pos).match(/^!!(\w+)/);
          if (!match) return false;
          if (!silent) {
            const token = state.push("doubleBang", "span", 0);
            token.content = match[1];
            token.attrs = [["data-shout", match[1]]];
          }
          state.pos += match[0].length;
          return true;
        });
        md.renderer.rules.doubleBang = (tokens, idx) =>
          `<span class="shout">${tokens[idx].content.toUpperCase()}</span>`;
      },
    ],
  },
});
```

---

### 🔒 Security

- Uses [`sanitize-html`](https://github.com/apostrophecms/sanitize-html) to strip dangerous HTML
- Only a whitelisted subset of tags and attributes are allowed
- All links get `rel="noopener noreferrer"` and `target="_blank"`

---

### 📊 Diagnostics

Pass `enableStats: true` in request to measure render time, input length:

```ts
{
  id: "xyz",
  html: "...",
  diagnostics: {
    timeMs: 2.17,
    length: 120
  }
}
```

---

### 📁 File Structure

```
markdown.worker.ts      → main WebWorker script
```

---

### 📜 License

MIT
