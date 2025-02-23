import { requestMeasure } from "../modules/fastdom";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
* Traps focus within a given container element by listening for "Tab" key events
* and forcing the focus to loop through the focusable elements inside the container.
*
* @param {HTMLElement} container - The element inside which the focus should be trapped.
* @returns {() => void} - A cleanup function to remove the focus trap.
*/
export default function trapFocus(container: HTMLElement): () => void {
  const keydownHandler = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;

    event.preventDefault();
    event.stopPropagation();

    const focusableElements = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];

    if (!focusableElements.length) return;

    const currentIndex = focusableElements.findIndex(
      (el) => el === document.activeElement
    );

    const nextIndex =
      currentIndex === -1
        ? 0
        : event.shiftKey
          ? currentIndex === 0
            ? focusableElements.length - 1
            : currentIndex - 1
          : (currentIndex + 1) % focusableElements.length;

    requestMeasure(() => {
      focusableElements[nextIndex].focus();
    });
  };

  document.addEventListener("keydown", keydownHandler, false);

  return () => {
    document.removeEventListener("keydown", keydownHandler, false);
  };
}
