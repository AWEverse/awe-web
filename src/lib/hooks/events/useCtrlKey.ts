import { useEffect } from 'react';

interface UseCtrlKeyProps {
  passedRef: React.RefObject<HTMLElement>;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}

const useCtrlKey = ({ passedRef, onKeyDown, onKeyUp }: UseCtrlKeyProps) => {
  useEffect(() => {
    const handleMouseEnter = () => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && onKeyDown) {
          onKeyDown(e);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (onKeyUp) {
          onKeyUp(e);
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      // Cleanup function to remove the event listeners
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    };

    const currentElement = passedRef.current;
    if (currentElement) {
      currentElement.addEventListener('mouseenter', handleMouseEnter);
      currentElement.addEventListener('mouseleave', () => {
        // Call onKeyUp to reset state or perform any action when mouse leaves
        if (onKeyUp) {
          onKeyUp(new KeyboardEvent('keyup'));
        }
      });
    }

    return () => {
      if (currentElement) {
        currentElement.removeEventListener('mouseenter', handleMouseEnter);
      }
    };
  }, [passedRef, onKeyDown, onKeyUp]);
};

export default useCtrlKey;
