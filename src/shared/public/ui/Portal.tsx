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
  const container = useMemo(() => {
    let el = document.getElementById(containerId);

    if (!el) {
      requestMutation(() => {
        el = document.createElement("div");
        el.id = containerId;
        document.body.appendChild(el);
      });
    }

    return el;
  }, [containerId]);

  // Only update className if it actually changes
  useEffect(() => {
    if (!container) return;
    if (className) {
      requestMutation(() => {
        if (!container.classList.contains(className)) {
          container.classList.add(className);
        }
      });
      return () => {
        requestMutation(() => {
          container.classList.remove(className);
        });
      };
    }
    return;
  }, [container, className]);

  // Avoid rendering until container is available
  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
