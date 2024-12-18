import { FC, ReactNode } from 'react';

interface OwnProps {}

interface StateProps {}

const SecondSlide: FC<OwnProps & StateProps> = () => {
  return <div>second slide</div>;
};

export default SecondSlide;
