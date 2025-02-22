import { requestMutation } from "@/lib/modules/fastdom";
import { FC, useEffect, ReactNode, useMemo } from "react";
import { createPortal } from "react-dom";

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
  const container = useMemo(
    () => document.getElementById(containerId),
    [containerId],
  );

  useEffect(() => {
    if (container && className) {
      requestMutation(() => {
        container.classList.add(className);
      });

      return () => {
        requestMutation(() => {
          container.classList.remove(className);
        });
      };
    }
  }, [container, className]);

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
