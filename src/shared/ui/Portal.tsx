import { requestMutation } from "@/lib/modules/fastdom";
import { FC, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRemoteRef } from "../hooks/base/useRemoteRef";

type OwnProps = {
  containerId?: string;
  className?: string;
  children: ReactNode;
};

const Portal: FC<OwnProps> = ({
  containerId = "modals-root",
  className,
  children,
}) => {
  const containerRef = useRemoteRef({
    id: containerId,
    observeDomChanges: true,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !className) return;

    requestMutation(() => {
      container.classList.add(className);
    });

    return () => {
      requestMutation(() => {
        container.classList.remove(className);
      });
    };
  }, [containerRef.current, className]);

  if (!containerRef.current) return null;

  return createPortal(children, containerRef.current);
};

export default Portal;
