import { useState, useRef } from "react";
import { throttle } from "@/lib/core";

interface IDimensions {
  width: number;
  height: number;
  x: number;
  y: number;
}

const initialState: IDimensions = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

const defaultCompare = (
  newDimensions: IDimensions,
  dimensions: IDimensions,
) => {
  if (!newDimensions || !dimensions) return !!newDimensions;

  const {
    width: newWidth,
    height: newHeight,
    x: newX,
    y: newY,
  } = newDimensions;
  const { width, height, x, y } = dimensions;

  return newWidth === width && newHeight === height && newX === x && newY === y;
};

const shouldDefault = () => false;

const sizePattern = (n: number) => (n === 0 ? "100%" : `${n}px`);

interface OwnProps {
  shallowDimensions?: (
    newDimensions: IDimensions,
    currentDimensions: IDimensions,
  ) => boolean;
  shouldSkipNode?: (target: HTMLElement) => boolean;
  skipRoot?: boolean;
  initialDimensions?: IDimensions;
  throttleDelay?: number;
}

const useScaledSelection = <T extends HTMLElement>({
  shallowDimensions = defaultCompare,
  shouldSkipNode = shouldDefault,
  initialDimensions = initialState,
  throttleDelay = 500,
}: OwnProps) => {
  const [dimensions, setDimensions] = useState<IDimensions>(initialDimensions);
  const rootRef = useRef<T | null>(null);

  const handleMouseOver = throttle((e: React.MouseEvent<T>) => {
    const target = e.target as HTMLElement;
    const root = rootRef.current;

    const isRoot = target === root;
    const currentTarget = isRoot ? root : target;

    const newDimensions = {
      width: currentTarget.offsetWidth,
      height: currentTarget.offsetHeight,
      x: isRoot ? 0 : target.offsetLeft,
      y: isRoot ? 0 : target.offsetTop,
    };

    const skipReasons =
      !root ||
      shallowDimensions(newDimensions, dimensions) ||
      shouldSkipNode(target);

    if (!skipReasons) {
      setDimensions(newDimensions);
    }
  }, throttleDelay);

  return { handleMouseOver, rootRef, dimensions };
};

export default useScaledSelection;
export { sizePattern };
export type { IDimensions };
