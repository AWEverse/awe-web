import { requestMutation } from "@/lib/modules/fastdom/fastdom";
import { useLayoutEffect } from "react";

function useBodyClass(className: string, condition: boolean) {
  useLayoutEffect(() => {
    if (typeof document === "undefined" || !className) return;

    const body = document.body;
    let needsUpdate = false;

    requestMutation(() => {
      const hasClass = body.classList.contains(className);
      needsUpdate = condition ? !hasClass : hasClass;

      if (needsUpdate) {
        body.classList.toggle(className, condition);
      }
    });

    return () => {
      if (!needsUpdate) return;

      requestMutation(() => {
        if (body.classList.contains(className)) {
          body.classList.remove(className);
        }
      });
    };
  }, [className, condition]);
}

export default useBodyClass;
