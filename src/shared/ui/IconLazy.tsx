const iconCache = new Map();

const loadIcon = (name: string) => {
  if (!iconCache.has(name)) {
    const promise = import(`./icons/${name}.js`)
      .then((module) => {
        iconCache.set(name, { status: "fulfilled", component: module.default });
      })
      .catch(() => {
        iconCache.set(name, { status: "rejected" });
      });

    iconCache.set(name, { status: "pending", promise });
  }
  return iconCache.get(name);
};

interface IconProps {
  name: string;
  [key: string]: any;
}

export const Icon = ({ name, ...props }: IconProps) => {
  const iconStatus = loadIcon(name);

  if (iconStatus.status === "pending") {
    throw iconStatus.promise;
  } else if (iconStatus.status === "fulfilled") {
    const IconComponent = iconStatus.component;
    return <IconComponent {...props} />;
  } else {
    return <div>Icon not found</div>;
  }
};
