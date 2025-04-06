import { FC, useRef } from "react";

type FreezeRequiredProps = {
  isOpen: boolean;
  ignoreFreeze?: boolean;
};

export default function withFreezeWhenClosed<P extends FreezeRequiredProps>(
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
