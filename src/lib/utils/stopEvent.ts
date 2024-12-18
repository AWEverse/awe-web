import React from 'react';

type IEvent = React.UIEvent | Event | React.FormEvent;

const stopEvent = (e: IEvent): void => {
  if (e.cancelable) {
    e.preventDefault?.();
    e.stopPropagation?.();
  }
};

export default stopEvent;
