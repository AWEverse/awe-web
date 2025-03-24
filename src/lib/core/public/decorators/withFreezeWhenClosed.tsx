import { FC, useRef } from "react";

interface FreezeProps {
  isOpen: boolean;
  ignoreFreeze?: boolean;
}

export function withFreezeWhenClosed<P extends FreezeProps>(
  WrappedComponent: FC<P>,
): FC<P> {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const FreezeComponent: FC<P> = (props) => {
    const prevPropsRef = useRef<P>(props);
    const { isOpen, ignoreFreeze = false } = props;

    if (ignoreFreeze) {
      return <WrappedComponent {...props} />;
    }

    if (isOpen) {
      prevPropsRef.current = props;
    }

    const frozenProps = isOpen
      ? props
      : { ...prevPropsRef.current, isOpen: false };

    return <WrappedComponent {...frozenProps} />;
  };

  FreezeComponent.displayName = `withFreezeWhenClosed(${displayName})`;

  return FreezeComponent;
}
