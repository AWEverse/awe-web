import { FC, ReactNode } from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface OwnProps {}

interface StateProps {}

const EmojiPicker: FC<OwnProps & StateProps> = () => {
  return <Picker data={data} theme="dark" emojiSize={32} perLine={9} />;
};

export default EmojiPicker;
