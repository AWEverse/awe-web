import { FC } from "react";

export type EmojiProps = React.ComponentProps<"em-emoji">;

const Emoji: FC<EmojiProps> = (props) => <em-emoji {...props} />;

export default Emoji;
