/**
 * Asynchronously detects if the script direction of a given text is RTL (right-to-left).
 * Uses multiple strategies:
 * 1. Unicode strong RTL characters
 * 2. Layout engine comparison
 * 3. Fallback to CSS computed style
 *
 * @param text - Text to analyze
 * @returns Promise resolving to `true` if RTL, else `false`
 */
export async function isScriptRtl(text: string): Promise<boolean> {
  if (!text) return false;

  const strongRtlPattern =
    /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF\u0860-\u086F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const weakRtlPattern = /[\u200F\u202B\u202E\u2067]/;

  if (strongRtlPattern.test(text)) return true;
  if (typeof document === "undefined" || !document.body) {
    return weakRtlPattern.test(text);
  }

  return new Promise<boolean>((resolve) => {
    // Create hidden container for layout testing
    const container = document.createElement("div");
    container.style.cssText = `
      position: absolute;
      visibility: hidden;
      font-family: Arial, sans-serif;
      font-size: 16px;
      direction: ltr;
      white-space: nowrap;
      width: max-content;
    `;

    const control = document.createElement("span");
    control.textContent = "\u202A|\u202C"; // LTR markers

    const test = document.createElement("span");
    test.textContent = text + "\u200E"; // LTR mark to stabilize layout

    container.append(control, test);
    document.body.appendChild(container);

    try {
      const controlRect = control.getBoundingClientRect();
      const testRect = test.getBoundingClientRect();

      const isLogicalRtl = testRect.left < controlRect.left;
      const isVisualRtl = testRect.right < controlRect.right;

      const layoutRtl = isLogicalRtl || isVisualRtl;

      const computedDir = getComputedStyle(test).direction;
      const cssRtl = computedDir === "rtl";

      resolve(layoutRtl || cssRtl);
    } catch {
      resolve(weakRtlPattern.test(text));
    } finally {
      container.remove();
    }
  });
}
