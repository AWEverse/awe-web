import { useEffect, useCallback, useState, useImperativeHandle, useRef } from 'react';

type AnchorPoint = {
  x: number;
  y: number;
};

interface ContextMenuProps {
  ref?: React.RefObject<HTMLDivElement>;
  containerRef?: React.RefObject<HTMLDivElement>;
}

const useContextMenu = (ref?: React.RefObject<HTMLElement>) => {
  const [anchorPoint, setAnchorPoint] = useState<AnchorPoint>({ x: 0, y: 0 });
  const [isShown, setIsShow] = useState(false);

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();

      const menuWidth = 200; // Example context menu width
      const menuHeight = 150; // Example context menu height
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let x = event.pageX;
      let y = event.pageY;

      // Get the bounding box of the reference element if available
      if (ref?.current) {
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        x = event.clientX - left;
        y = event.clientY - top;

        // Adjust the coordinates relative to the container's size
        if (x + menuWidth > width) {
          x = width - menuWidth;
        }
        if (y + menuHeight > height) {
          y = height - menuHeight;
        }

        if (width < menuWidth || height < menuHeight) {
          x = (width - menuWidth) / 2;
          y = (height - menuHeight) / 2;
        }
      }

      // Handle window boundary to ensure the context menu fits
      if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth;
      }
      if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight;
      }

      setAnchorPoint({ x, y });
      setIsShow(true);
    },
    [ref],
  );

  const handleClick = useCallback(() => {
    if (isShown) {
      setIsShow(false);
    }
  }, [isShown]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleClick, handleContextMenu]);

  return { anchorPoint, isShown };
};

export { useContextMenu };
