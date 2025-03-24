import { useComponentDidMount } from '@/shared/hooks/effects/useLifecycle';

const listenerOptions = { passive: false };

const useGlobalDragEventPrevention = () => {
  useComponentDidMount(() => {
    const body = document.body;

    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;

      const target = e.target as HTMLElement;

      if (!target?.dataset?.dropzone) {
        e.dataTransfer.dropEffect = 'none';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    body.addEventListener('dragover', handleDrag, listenerOptions);
    body.addEventListener('dragenter', handleDrag, listenerOptions);
    body.addEventListener('drop', handleDrop, listenerOptions);

    return () => {
      body.removeEventListener('dragover', handleDrag);
      body.removeEventListener('dragenter', handleDrag);
      body.removeEventListener('drop', handleDrop);
    };
  });
};

export default useGlobalDragEventPrevention;
