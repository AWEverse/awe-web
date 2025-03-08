import { requestMutation } from "@/lib/modules/fastdom";
import { useLayoutEffect } from "react";

function useBodyClass(className: string, condition: boolean) {
  useLayoutEffect(() => {
    if (typeof document === "undefined" || !className) return;

    const body = document.body;
    let needsUpdate = false;

    const hasClass = body.classList.contains(className);
    needsUpdate = condition ? !hasClass : hasClass;

    if (needsUpdate) {
      body.classList.toggle(className, condition);
    }

    return () => {
      if (!needsUpdate) return;


      if (body.classList.contains(className)) {
        body.classList.remove(className);
      }

    };
  }, [className, condition]);
}

function useBodyClasses(classConditions: Record<string, boolean>) {
  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;

    Object.entries(classConditions).forEach(([className, condition]) => {
      body.classList.toggle(className, condition);
    });


    return () => {
      Object.entries(classConditions).forEach(([className, condition]) => {
        if (condition && body.classList.contains(className)) {
          body.classList.remove(className);
        }
      });

    };
  }, [JSON.stringify(classConditions)]);
}

export { useBodyClasses };
export default useBodyClass;
