import { forwardRef, memo } from 'react';
import s from './SearchList.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface OwnProps {
  className?: string;
}

const SearchList = forwardRef<HTMLElement, OwnProps>((props, ref) => {
  const { className } = props;

  return (
    <section ref={ref} className={buildClassName(s.LeftMainSearchBody, className)}>
      <nav className={s.SeacrhNavBar}> Search result navigation </nav>

      <ul className={s.SearchList}>
        <li aria-details="Search result 1" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 1</h2>
          <p>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit quae perferendis debitis sit? Asperiores nam
            aperiam, dolor unde, quia aliquid omnis, officia recusandae molestias fugiat praesentium consequatur? Minima, eveniet
            voluptate.
          </p>
        </li>
        <li aria-details="Search result 2" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 2</h2>
        </li>
        <li aria-details="Search result 3" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 3</h2>
        </li>
        <li aria-details="Search result 4" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 4</h2>
        </li>
        <li aria-details="Search result 5" className={s.SearchResult}>
          <h2 className={s.SeacrhResultTitle}>Search result 5</h2>
        </li>
      </ul>
    </section>
  );
});

export default memo(SearchList);
