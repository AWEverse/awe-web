import TextArea from '@/shared/ui/TextArea';
import { FC } from 'react';

import './index.scss';

interface OwnProps {}

interface StateProps {}

const MiddleInput: FC<OwnProps & StateProps> = () => {
  return (
    <div className="MiddleInput">
      <TextArea
        id="middle-input"
        placeholder="Type a message"
        maxLength={4096}
        maxLengthIndicator={'Characters left: 4096'}
        tabIndex={0}
      />
    </div>
  );
};

export default MiddleInput;
