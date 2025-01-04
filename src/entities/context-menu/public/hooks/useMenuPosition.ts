interface IAnchorPosition {
  x: number;
  y: number;
}

interface IAnchorOrigin {
  x: string;
  y: string;
}

interface MenuPositionConfiguration {
  rootOffset?: number;
}

export default function useMenuPosition(configuration: MenuPositionConfiguration) {
  return (
    e: React.MouseEvent,
    cntxRef: React.RefObject<HTMLDivElement>,
  ): { position: IAnchorPosition; transformOrigin: IAnchorOrigin } => {
    const WIDTH = 200;
    const HEIGHT = 350;

    if (!cntxRef.current) {
      return { position: { x: 0, y: 0 }, transformOrigin: { x: 'left', y: 'top' } };
    }

    const isRightIntersect = e.clientX + WIDTH > window.innerWidth;
    const isBottomIntersect = e.clientY + HEIGHT > window.innerHeight;

    let newX = e.clientX;
    let newY = e.clientY;

    if (isBottomIntersect) {
      newY = e.clientY - cntxRef.current.clientHeight; // Move up
    }
    if (isRightIntersect) {
      newX = e.clientX - cntxRef.current.clientWidth; // Move left
    }

    const transformOrigin = {
      x: isRightIntersect ? 'right' : 'left',
      y: isBottomIntersect ? 'bottom' : 'top',
    };

    return { position: { x: newX, y: newY }, transformOrigin };
  };
}
