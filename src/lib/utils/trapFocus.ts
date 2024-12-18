import { requestMeasure } from '../modules/fastdom/fastdom';

const SELECTABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function trapFocus(element: HTMLElement) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const focusableElements = Array.from(element.querySelectorAll(SELECTABLE)) as HTMLElement[];

    if (!focusableElements.length) {
      return;
    }

    const currentFocusedIndex = focusableElements.findIndex(em =>
      em.isSameNode(document.activeElement),
    );

    const getFocusIndex = () => {
      if (currentFocusedIndex === -1) return 0;

      if (e.shiftKey) {
        return currentFocusedIndex === 0 ? focusableElements.length - 1 : currentFocusedIndex - 1;
      }

      return (currentFocusedIndex + 1) % focusableElements.length;
    };

    requestMeasure(() => {
      focusableElements[getFocusIndex()].focus();
    });
  }

  document.addEventListener('keydown', handleKeyDown, false);

  return () => {
    document.removeEventListener('keydown', handleKeyDown, false);
  };
}
