import { throttle, IS_MOBILE } from "@/lib/core";
import { useStableCallback } from "@/shared/hooks/base";

const useGridInteraction = (
  gridRef: React.RefObject<HTMLDivElement | null>,
) => {
  const handleMove = useStableCallback(
    throttle((clientX: number, clientY: number) => {
      const grid = gridRef.current;
      if (!grid) return;

      const rect = grid.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      grid.style.setProperty("--mouse-x", `${x}px`);
      grid.style.setProperty("--mouse-y", `${y}px`);
    }, 16),
  );

  const _handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMove(e.clientX, e.clientY);
  };

  const _handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  return {
    handleMouseMove: !IS_MOBILE ? _handleMouseMove : undefined,
    handleTouchMove: IS_MOBILE ? _handleTouchMove : undefined,
  };
};

export default useGridInteraction;
