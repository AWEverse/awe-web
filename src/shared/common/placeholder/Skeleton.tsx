import React from 'react';
import { CSSTransition } from 'react-transition-group';
import s from './skeleton.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

interface SkeletonProps {
  loading: boolean | (() => boolean);
  className?: string;
  children?: React.ReactNode | (() => React.ReactNode);
}

const Skeleton: React.FC<SkeletonProps> = props => {
  const children = typeof props.children === 'function' ? props.children() : props.children;
  const loading = typeof props.loading === 'function' ? props.loading() : props.loading;

  return (
    <CSSTransition in={!loading} timeout={100} classNames="fade" unmountOnExit>
      {loading ? (
        <div className={buildClassName(s.skeleton, props.className ?? '')} />
      ) : (
        <div className={s.skeletonChild}>{children}</div>
      )}
    </CSSTransition>
  );
};

export default Skeleton;
