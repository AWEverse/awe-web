import { requestMeasure } from "../modules/fastdom";

const FOCUSABLE_SELECTOR =
  'button:not([hidden]):not([disabled]), [href]:not([hidden]):not([disabled]), input:not([hidden]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex]:not([tabindex="-1"]):not([hidden]):not([disabled])';

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

    if (!focusableElements.length) {
      if (container.tabIndex >= 0) {
        requestMeasure(() => {
          container.focus();
        });
      }
      return;
    }

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

  if (!container.contains(document.activeElement)) {
    const focusableElements = Array.from(
      container.querySelectorAll(FOCUSABLE_SELECTOR)
    ) as HTMLElement[];
    const firstFocusable = focusableElements[0];

    if (firstFocusable) {
      requestMeasure(() => {
        firstFocusable.focus();
      });
    } else if (container.tabIndex >= 0) {
      requestMeasure(() => {
        container.focus();
      });
    }
  }

  document.addEventListener("keydown", keydownHandler, false);

  return () => {
    document.removeEventListener("keydown", keydownHandler, false);
  };
}
