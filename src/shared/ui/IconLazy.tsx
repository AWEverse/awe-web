import React, { Suspense, ComponentType } from "react";

// Props: iconName (string), any other SVGIcon props
interface LazyIconProps {
  iconName: string;
  // e.g. color, fontSize, etc.
  [key: string]: any;
}

/**
 * Dynamically loads a MUI icon component by name.
 */
export const LazyIcon: React.FC<LazyIconProps> = ({ iconName, ...props }) => {
  const IconComponent = React.lazy(async () => {
    const mod = await import(
      /* webpackChunkName: "mui-icon-[request]" */
      `@mui/icons-material/${iconName}`
    );
    return { default: mod.default as ComponentType<any> };
  });

  return (
    <Suspense fallback={<span style={{ width: 24, height: 24 }} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};
