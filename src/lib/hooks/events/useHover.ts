/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneElement, useState, ReactElement } from "react";
import { noop } from "../../utils/listener";
import { useStableCallback } from "@/shared/hooks/base";

export type Element =
  | ((state: boolean) => ReactElement<any>)
  | ReactElement<any>;

const useHover = (element: Element): [ReactElement<any>, boolean] => {
  const [state, setState] = useState<boolean>(false);

  const onMouseEnter = useStableCallback(
    (originalOnMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void) =>
      (event: React.MouseEvent<HTMLElement>) => {
        (originalOnMouseEnter || noop)(event);
        setState(true);
      },
  );

  const onMouseLeave = useStableCallback(
    (originalOnMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void) =>
      (event: React.MouseEvent<HTMLElement>) => {
        (originalOnMouseLeave || noop)(event);
        setState(false);
      },
  );

  const renderElement =
    typeof element === "function" ? element(state) : element;

  const el = cloneElement(renderElement, {
    onMouseEnter: onMouseEnter(renderElement.props.onMouseEnter),
    onMouseLeave: onMouseLeave(renderElement.props.onMouseLeave),
  });

  return [el, state];
};

export default useHover;
