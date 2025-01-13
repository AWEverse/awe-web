import { requestMeasure } from '../modules/fastdom/fastdom';
import stopEvent from './stopEvent';

const SELECTABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' as const;

export default function trapFocus(element: HTMLElement) {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }

    stopEvent(e);

    const focusableElements = Array.from(element.querySelectorAll(SELECTABLE)) as HTMLElement[];

    if (!focusableElements.length) {
      return;
    }

    const currentFocusedIndex = focusableElements.findIndex(em =>
      em.isSameNode(document.activeElement),
    );

    const getFocusIndex = () => {
      if (currentFocusedIndex === -1) {
        return 0;
      }

      if (e.shiftKey) {
        if (currentFocusedIndex === 0) {
          return focusableElements.length - 1;
        }

        return currentFocusedIndex - 1;
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
