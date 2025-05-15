import { useCallback, useEffect, useRef } from 'react';

interface UseKeyboardNavigationProps {
  onNavigate: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onSelect: () => void;
  onCancel: () => void;
  isEnabled: boolean;
}

export function useKeyboardNavigation({
  onNavigate,
  onSelect,
  onCancel,
  isEnabled,
}: UseKeyboardNavigationProps) {
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onNavigate('left');
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNavigate('right');
        break;
      case 'ArrowUp':
        e.preventDefault();
        onNavigate('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigate('down');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect();
        break;
      case 'Escape':
        e.preventDefault();
        onCancel();
        break;
    }
  }, [isEnabled, onNavigate, onSelect, onCancel]);

  useEffect(() => {
    if (isEnabled) {
      // Store last active element and focus calendar
      lastActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lastActiveElement.current && document.contains(lastActiveElement.current)) {
        lastActiveElement.current.focus();
      }
    };
  }, [isEnabled, handleKeyDown]);

  return {
    // Return focus management utils if needed
  };
}
