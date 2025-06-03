import { FC, useState, useEffect, useMemo, ReactNode, memo } from "react";

interface SheduledRenderProps {
  delay: number & { __brand: "positive" };
  children: ReactNode;
  fallback?: ReactNode | null;
}

const SheduledRender: FC<SheduledRenderProps> = ({
  delay,
  children,
  fallback = null,
}) => {
  const [visible, setVisible] = useState(false);
  const memoizedChildren = useMemo(() => children, [children]);
  const memoizedFallback = useMemo(() => fallback, [fallback]);

  useEffect(() => {
    let mounted = true;

    const timeout = setTimeout(() => {
      if (mounted) setVisible(true);
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [delay]);

  if (delay < 0) {
    return <div>{memoizedChildren}</div>;
  }

  return visible ? (
    <div aria-live="polite">{memoizedChildren}</div>
  ) : (
    <div aria-hidden="true">{memoizedFallback}</div>
  );
};

export default memo(SheduledRender);
