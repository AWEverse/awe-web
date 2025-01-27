import { FC, useRef, ComponentProps } from "react";

interface WithFreezeWhenClosedProps {
  isOpen: boolean;
}

export default function withFreezeWhenClosed<
  T extends FC<WithFreezeWhenClosedProps & Record<string, unknown>>,
>(WrappedComponent: T) {
  type WrappedProps = ComponentProps<T>;

  function ComponentWrapper(props: WrappedProps) {
    const lastOpenProps = useRef<WrappedProps>(props);
    const frozenProps = useRef<WrappedProps | null>(null);

    if (props.isOpen) {
      lastOpenProps.current = props;
      frozenProps.current = null;
    } else if (!frozenProps.current) {
      frozenProps.current = {
        ...lastOpenProps.current,
        isOpen: false,
      };
    }

    const actualProps = props.isOpen
      ? lastOpenProps.current
      : frozenProps.current!;

    return <WrappedComponent {...(actualProps as any)} />;
  }

  return ComponentWrapper as FC<WrappedProps>;
}
