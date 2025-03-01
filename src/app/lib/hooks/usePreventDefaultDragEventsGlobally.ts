import { useComponentDidMount } from '@/shared/hooks/effects/useLifecycle';

const usePreventDefaultDragEventsGlobally = () => {
  useComponentDidMount(() => {
    const body = document.body;

    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;
      if (!(e.target as HTMLElement).dataset.dropzone) {
        e.dataTransfer.dropEffect = 'none';
      } else {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    body.addEventListener('dragover', handleDrag);
    body.addEventListener('dragenter', handleDrag);
    body.addEventListener('drop', handleDrop);

    return () => {
      body.removeEventListener('dragover', handleDrag);
      body.removeEventListener('dragenter', handleDrag);
      body.removeEventListener('drop', handleDrop);
    };
  });
};

export default usePreventDefaultDragEventsGlobally;
