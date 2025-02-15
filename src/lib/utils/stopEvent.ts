import React from "react";
import { DEBUG } from "../config/dev";

type GenericEvent<T> =
  | React.KeyboardEvent<T>
  | React.SyntheticEvent<T>
  | React.UIEvent<T>
  | React.MouseEvent<T>
  | React.FormEvent<T>

const stopEvent = <T = Element>(event: GenericEvent<T>): void => {
  if (event) {
    const nativeEvent = event?.nativeEvent || event;

    try {
      if (nativeEvent.stopPropagation) nativeEvent.stopPropagation();
      if (nativeEvent.preventDefault) nativeEvent.preventDefault();
    } catch (err) {
      if (DEBUG) {
        console.error("src\\lib\\utils\\stopEvent.ts:", err);
      }
    }
  }
};

export default stopEvent;
