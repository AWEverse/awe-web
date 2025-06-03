type TargetCallback = (entry: IntersectionObserverEntry) => void;
type RootCallback = (entries: IntersectionObserverEntry[]) => void;

interface IIntersectionController {
  observer: IntersectionObserver;
  addCallback: (element: Element, callback: TargetCallback) => void;
  removeCallback: (element: Element, callback: TargetCallback) => void;
  observeElement: (element: Element) => void;
  unobserveElement: (element: Element) => void;
  destroy: NoneToVoidFunction;
}

interface IntersectionResponse {
  observe: ObserveFn;
  freeze: NoneToVoidFunction;
  unfreeze: NoneToVoidFunction;
}

type ObserveFn = (
  target: Element,
  targetCallback?: TargetCallback,
) => NoneToVoidFunction;

export {
  type TargetCallback,
  type RootCallback,
  type IIntersectionController,
  type IntersectionResponse,
  type ObserveFn,
};
