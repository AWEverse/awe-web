import { DependencyList, useRef, useEffect, MutableRefObject } from 'react';
import Slider from 'react-slick';

const getSliderFromRef = (ref: MutableRefObject<Slider | null>) => {
  return ref.current ?? undefined;
};

function useSlidersSync(dependencies: DependencyList[] = []) {
  const slider1 = useRef<Slider | null>(null);
  const slider2 = useRef<Slider | null>(null);

  useEffect(() => {
    if (slider1.current && slider2.current) {
      slider1.current.slickGoTo(slider2.current.state);
      slider2.current.slickGoTo(slider1.current.state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { slider1, slider2 };
}

export default useSlidersSync;
export { getSliderFromRef };
