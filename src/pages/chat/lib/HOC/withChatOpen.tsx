import { FC } from 'react';

interface OwnProps {
  onClick: () => void;
}

interface StateProps {
  chatId: string;
}

function withChatOpen<T extends OwnProps & StateProps>(Component: FC<T>) {
  return function (props: StateProps) {
    const handleClick = () => {
      console.log(`Chat ${props.chatId} opened`);
      // Custom logic for opening chat
    };

    return <Component {...(props as T)} onClick={handleClick} />;
  };
}

export default withChatOpen;
