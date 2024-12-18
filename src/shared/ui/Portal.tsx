import { FC, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type OwnProps = {
  containerId?: string;
  className?: string;
  children: ReactNode;
};

const Portal: FC<OwnProps> = ({ containerId = 'modals-root', className, children }) => {
  useEffect(() => {
    const container = document.querySelector(`#${containerId}`);

    if (!container) {
      console.warn(`Container with id "${containerId}" not found.`);
      return;
    }

    if (className) {
      container.classList.add(className);
    }

    return () => {
      if (className) {
        container.classList.remove(className);
      }
    };
  }, [className, containerId]);

  const container = document.querySelector(`#${containerId}`);

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
