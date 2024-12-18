import { MessageType } from '../../../../../../shared/ui/messages/types';

const distanceTime = (currentMessage: MessageType, previousMessage: MessageType, delay: number = 120000) => {
  if (!previousMessage) {
    return true;
  }

  const isDifferentStatus = currentMessage.sender !== previousMessage.sender;
  const isTimeGapExceeded = currentMessage.timeCache - previousMessage.timeCache > delay;

  return isDifferentStatus || isTimeGapExceeded;
};

export default distanceTime;
