import Emoji, { EmojiProps } from "@/shared/ui/Emoji";
import IconButton from "@/shared/ui/IconButton";
import { FC, memo } from "react";

type EmojiButtonProps = ReadonlyPartial<
  EmojiProps & React.ComponentProps<typeof IconButton>
>;

const EmojiButton: FC<EmojiButtonProps> = ({
  id,
  shortcodes,
  native,
  skin,
  size,
  set,
  fallback,
  ...props
}) => {
  const emojiProps = {
    id,
    shortcodes,
    native,
    skin,
    size,
    set,
    fallback,
  };

  return (
    <IconButton {...props}>
      <Emoji {...emojiProps} />
    </IconButton>
  );
};

EmojiButton.displayName = "EmojiButton";

export default memo(EmojiButton);
