import { FC } from 'react';
import './MoonPhases.scss';

interface OwnProps {
  phase: number;
}

const MoonPhases: FC<OwnProps> = ({ phase }) => {
  return (
    <div className="moon">
      <div className="disc"></div>
    </div>
  );
};

export default MoonPhases;
