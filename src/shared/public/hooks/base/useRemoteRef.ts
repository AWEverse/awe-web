import React, { useEffect, useRef } from "react";

type RemoteRefOptions = {
  selector?: string;
  id?: string;
  name?: string;
  root?: Document | HTMLElement;
  refreshDeps?: React.DependencyList[];
  observeDomChanges?: boolean;
};

export function useRemoteRef<T extends HTMLElement = HTMLElement>(
  options: RemoteRefOptions,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const resolveElement = () => {
    const root = options.root ?? document;

    let el: T | null = null;
    if (options.selector) {
      el = root.querySelector<T>(options.selector);
    } else if (options.id) {
      el = (
        root instanceof Document
          ? root.getElementById(options.id)
          : root.querySelector<T>(`#${options.id}`)
      ) as T | null;
    } else if (options.name) {
      el = root.querySelector<T>(`[name="${options.name}"]`);
    }

    ref.current = el;
  };

  useEffect(() => {
    resolveElement();

    if (options.observeDomChanges) {
      const rootNode = (options.root ?? document) as HTMLElement;
      const observer = new MutationObserver(() => {
        resolveElement();
      });

      observer.observe(rootNode, {
        childList: true,
        subtree: true,
      });

      observerRef.current = observer;

      return () => {
        observer.disconnect();
      };
    }
  }, [
    options.selector,
    options.id,
    options.name,
    options.root,
    options.observeDomChanges,
    ...(options.refreshDeps ?? [] as const),
  ]);

  return ref;
}
