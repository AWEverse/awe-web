import { requestMutation } from "@/lib/modules/fastdom";
import { useIsomorphicLayoutEffect } from "@/shared/hooks/effects/useIsomorphicEffect";
import { useRef } from "react";

function useDocumentTitle(title: string) {
  const prevTitle = useRef<string>(document.title);

  useIsomorphicLayoutEffect(() => {
    requestMutation(() => {
      if (typeof title === "string" && title.trim().length > 0) {
        const newTitle = title.trim();

        if (newTitle !== prevTitle.current) {
          document.title = newTitle;
          prevTitle.current = newTitle;
        }
      } else {
        prevTitle.current = "";
      }
    })
  }, [title]);
}

export default useDocumentTitle;
