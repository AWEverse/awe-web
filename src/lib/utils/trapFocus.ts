import { requestMeasure } from "../modules/fastdom";

const FOCUSABLE_SELECTOR = `
  button:not([hidden]):not([disabled]),
  [href]:not([hidden]):not([disabled]),
  input:not([hidden]):not([disabled]),
  select:not([hidden]):not([disabled]),
  textarea:not([hidden]):not([disabled]),
  [tabindex]:not([tabindex="-1"]):not([hidden]):not([disabled])
`
  .replace(/\s+/g, " ")
  .trim();

export default function trapFocus(container: HTMLElement): () => void {
  const focusableElements = Array.from(
    container.querySelectorAll(FOCUSABLE_SELECTOR),
  ) as HTMLElement[];

  const focusFirst = () => {
    const first =
      focusableElements[0] || (container.tabIndex >= 0 ? container : null);

    first && requestMeasure(() => first.focus());
  };

  const keydownHandler = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    event.preventDefault();
    event.stopPropagation();

    if (!focusableElements.length) {
      focusFirst();
      return;
    }

    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement,
    );
    const nextIndex =
      currentIndex === -1
        ? 0
        : event.shiftKey
          ? currentIndex === 0
            ? focusableElements.length - 1
            : currentIndex - 1
          : (currentIndex + 1) % focusableElements.length;

    requestMeasure(() => focusableElements[nextIndex].focus());
  };

  if (!container.contains(document.activeElement)) focusFirst();

  document.addEventListener("keydown", keydownHandler);
  return () => document.removeEventListener("keydown", keydownHandler);
}
