/**
 * Robustly detects text direction using multiple strategies:
 * 1. Unicode RTL character detection
 * 2. Layout engine verification
 * 3. Fallback to computed CSS direction
 *
 * @param text - Text to analyze
 * @param callback - Returns true for RTL, false for LTR
 */
export function isScriptRtl(
  text: string,
  callback: (result: boolean) => void,
): void {
  if (!text) {
    callback(false);
    return;
  }

  const hasStrongRtl =
    /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0780-\u07BF\u0860-\u086F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      text,
    );
  const hasWeakRtl = /[\u200F\u202B\u202E\u2067]/.test(text);

  if (hasStrongRtl) {
    callback(true);
    return;
  }

  if (typeof document === "undefined" || !document.body) {
    callback(hasWeakRtl);
    return;
  }

  const fragment = document.createDocumentFragment();

  const testDiv = document.createElement("div");
  testDiv.style.cssText = `
      position: absolute;
      visibility: hidden;
      width: max-content;
      font-size: 16px;
      font-family: 'Arial', sans-serif;
      direction: ltr;
      white-space: nowrap;
    `;

  const controlSpan = document.createElement("span");
  const testSpan = document.createElement("span");

  controlSpan.textContent = "\u202A|\u202C";
  testSpan.textContent = `${text}\u200E`;

  testDiv.append(controlSpan, testSpan);
  fragment.appendChild(testDiv);
  document.body.appendChild(fragment);

  try {
    const controlRect = controlSpan.getBoundingClientRect();
    const testRect = testSpan.getBoundingClientRect();

    const isLogicalRtl = testRect.left < controlRect.left;
    const isVisualRtl = testRect.right < controlRect.right;

    const layoutDetection = isLogicalRtl || isVisualRtl;

    const computedDirection = window.getComputedStyle(
      testSpan as Element,
    ).direction;
    const styleDetection = computedDirection === "rtl";

    callback(layoutDetection || styleDetection);
  } catch (error) {
    callback(hasWeakRtl);
  } finally {
    document.body.removeChild(testDiv);
  }
}
