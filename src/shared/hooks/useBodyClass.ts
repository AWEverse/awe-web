import { requestMutation } from '@/lib/modules/fastdom/fastdom';
import { useLayoutEffect } from 'react';

function useBodyClass(className: string, condition: boolean) {
  useLayoutEffect(() => {
    requestMutation(() => {
      if (condition) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    });

    return () => {
      requestMutation(() => {
        document.body.classList.remove(className);
      });
    };
  }, [className, condition]);
}

export default useBodyClass;
