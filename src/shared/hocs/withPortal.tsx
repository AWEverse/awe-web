import { FC } from 'react';
import Portal from '../ui/Portal';

function withPortal<T extends FC<any>>(Component: T, usePortal: boolean) {
  return (props: React.ComponentProps<T>) => {
    if (usePortal) {
      return (
        <Portal>
          <Component {...props} />
        </Portal>
      );
    }

    return <Component {...props} />;
  };
}

export default withPortal;
