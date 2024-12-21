import { render as baseRender } from '@testing-library/react/pure';
import React from 'react';

export * from '@testing-library/react';
export function render(element: React.ReactElement, options: any = {}) {
  const result = baseRender(element, options);

  return {
    ...result,
    setProps(props: any) {
      result.rerender(React.cloneElement(element, props));
    },
  };
}
