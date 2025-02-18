import { useComponentDidMount } from '@/shared/hooks/effects/useLifecycle';
import { useState } from 'react';

export function usePageVisibility(): boolean {
  const [result, setResult] = useState(!document.hidden);

  useComponentDidMount(() => {
    const updatePageVisibility = () => {
      setResult(!document.hidden);
    };

    updatePageVisibility();

    document.addEventListener('visibilitychange', updatePageVisibility, false);

    return () => {
      document.removeEventListener(
        'visibilitychange',
        updatePageVisibility,
        false
      );
    };
  });

  return result;
}
