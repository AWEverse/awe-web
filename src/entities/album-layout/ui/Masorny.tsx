import { Children, FC, ReactNode } from 'react';

import s from './Masorny.module.scss';

interface OwnProps {
  children: ReactNode;
}

const Masorny: FC<OwnProps> = props => {
  const { children } = props;

  return (
    <section className={s.AlbumMasonry} id="MasornyGrid">
      {Children.map(children, (child, index) => (
        <div key={`masorny-item-${index}`} className={s.MasornySell}>
          {child}
        </div>
      ))}
    </section>
  );
};

export default Masorny;
