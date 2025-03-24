import { useLayoutEffect } from "react";

// Global Map to track the number of instances requiring each class
const bodyClassCounts = new Map<string, number>();

/**
 * Hook to manage a single class on the body element based on a condition.
 * @param className The class to add or remove
 * @param condition Whether the class should be present
 */
function useBodyClass(className: string, condition: boolean) {
  useLayoutEffect(() => {
    if (typeof document === "undefined" || !className) return;

    const body = document.body;

    if (condition) {
      const currentCount = bodyClassCounts.get(className) || 0;

      if (currentCount === 0) {
        body.classList.add(className);
      }

      bodyClassCounts.set(className, currentCount + 1);

      return () => {
        const currentCount = bodyClassCounts.get(className) || 0;
        const newCount = currentCount - 1;
        if (newCount <= 0) {
          body.classList.remove(className);
          bodyClassCounts.delete(className);
        } else {
          bodyClassCounts.set(className, newCount);
        }
      };
    }
  }, [className, condition]);
}

/**
 * Hook to manage multiple classes on the body element based on conditions.
 * @param classConditions Record mapping class names to their conditions
 */
function useBodyClasses(classConditions: Record<string, boolean>) {
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;

    const classesToManage = Object.entries(classConditions)
      .filter(([_, condition]) => condition)
      .map(([className]) => className);

    classesToManage.forEach((className) => {
      const currentCount = bodyClassCounts.get(className) || 0;
      if (currentCount === 0) {
        body.classList.add(className);
      }
      bodyClassCounts.set(className, currentCount + 1);
    });

    return () => {
      classesToManage.forEach((className) => {
        const currentCount = bodyClassCounts.get(className) || 0;
        const newCount = currentCount - 1;

        if (newCount <= 0) {
          body.classList.remove(className);
          bodyClassCounts.delete(className);
        } else {
          bodyClassCounts.set(className, newCount);
        }
      });
    };
  }, [classConditions]);
}

export { useBodyClasses };
export default useBodyClass;
