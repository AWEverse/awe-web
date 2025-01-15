import React from 'react';
import { DEBUG } from '../config/dev';

type IEvent = React.UIEvent | Event | React.FormEvent;

const stopEvent = (event: IEvent): void => {
  if (event) {
    // 'input' event will have cancelable=false, but we still need to preventDefault
    // if(!event.cancelable) {
    //   return false;
    // }

    // @ts-ignore
    event = event.originalEvent || event;

    try {
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
    } catch (err) {
      if (DEBUG) {
        console.error('src\\lib\\utils\\stopEvent.ts: ' + err);
      }
    }
  }
};

export default stopEvent;
