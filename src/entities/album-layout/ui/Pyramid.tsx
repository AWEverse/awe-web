import { Children, FC, ReactNode } from 'react';

import s from './Pyramid.module.scss';

interface OwnProps {
  children: ReactNode;
}

const Pyramid: FC<OwnProps> = props => {
  const { children } = props;

  return (
    <section className={s.AlbumPyramid} id="PyramidGrid">
      {Children.map(children, (child, index) => (
        <div key={`Pyramid-item-${index}`} className={s.PyramidSell}>
          {child}
        </div>
      ))}
    </section>
  );
};

export default Pyramid;
