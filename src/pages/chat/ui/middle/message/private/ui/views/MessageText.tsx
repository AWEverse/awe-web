import { FC, ReactNode } from 'react';

interface OwnProps {
  children: ReactNode;
}

interface StateProps {}

const MessageText: FC<OwnProps & StateProps> = () => {
  return <p></p>;
};

export default MessageText;
