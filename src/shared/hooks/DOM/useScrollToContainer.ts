import { useEffect, useRef } from "react";

const useScrollToContainer = (activeEl: number) => {
  const parentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!parentRef.current) return;

    const target = parentRef.current.children[activeEl];
    if (!target) return;

    const container = target.closest('.scrollable-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeEl]);

  return parentRef;
};

export default useScrollToContainer;
