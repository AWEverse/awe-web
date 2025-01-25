/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef } from "react";

interface WithFreezeWhenClosedProps {
  isOpen: boolean;
}

type OwnProps<T extends FC<any>> = WithFreezeWhenClosedProps & Parameters<T>[0];

export default function withFreezeWhenClosed<T extends FC<any>>(
  CurrentComponent: T,
): T {
  function ComponentWrapper(props: OwnProps<T>) {
    const newProps = useRef<OwnProps<T>>(props);

    if (props.isOpen) {
      // If `isOpen` is true, update `newProps` with the incoming props.
      newProps.current = props;
    } else {
      // If `isOpen` is false, retain the previous props but explicitly set `isOpen` to false.
      newProps.current = {
        ...newProps.current, // Preserve the existing props
        isOpen: false, // Ensure `isOpen` is set to false
      };
    }

    // eslint-disable-next-line react/react-in-jsx-scope
    return <CurrentComponent {...newProps.current} />;
  }

  return ComponentWrapper as T;
}
