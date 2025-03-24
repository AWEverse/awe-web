import { FC, useRef, useMemo } from "react";

const NO_DEPS = [] as const;

interface WrappedComponentProps {
  isOpen: boolean;
  ignoreFreeze?: boolean;
  [key: string]: unknown;
}

export default function withFreezeWhenClosed<T extends WrappedComponentProps>(
  WrappedComponent: FC<T>,
): FC<T> {
  const EnhancedComponent: FC<T> = (props) => {
    const openPropsRef = useRef<T>(props);
    const { isOpen, ignoreFreeze = false } = props;

    if (isOpen) {
      openPropsRef.current = props;
    }

    const frozenProps = useMemo(
      () => ({
        ...openPropsRef.current,
        isOpen: false,
      }),
      NO_DEPS,
    );

    const finalProps = isOpen && !ignoreFreeze ? props : frozenProps;

    return <WrappedComponent {...finalProps} />;
  };

  // Improve debugging by setting display name
  EnhancedComponent.displayName = `withFreezeWhenClosed(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
