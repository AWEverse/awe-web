import { FC, useState, memo } from "react";
import s from "./LeftMainHeader.module.scss";
import SearchInput from "@/shared/ui/SearchInput";
import { ArrowForwardRounded } from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import { useStableCallback } from "@/shared/hooks/base";
import useChatStore from "@/pages/chat/store/useChatSelector";

interface OwnProps {
  onFocus?: () => void;
  onReset?: () => void;
  onBlur?: () => void;
}

interface StateProps {}

const useSearchInput = () => {
  const [value, setValue] = useState("");

  const handleChange = useStableCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
  );

  const handleReset = useStableCallback(() => {
    setValue("");
  });

  return { value, handleChange, handleReset };
};

const LeftMainHeader: FC<OwnProps & StateProps> = ({ onFocus, onBlur }) => {
  const toggleLeftPanel = useChatStore((s) => s.toggleChatList);

  const { value, handleChange, handleReset } = useSearchInput();

  return (
    <div className={s.LeftMainHeader}>
      <SearchInput
        tabIndex={-1}
        className={s.SearchInput}
        size="large"
        value={value}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={onFocus}
        onReset={handleReset}
      />
      <IconButton className={s.CloseButton} onClick={toggleLeftPanel}>
        <ArrowForwardRounded />
      </IconButton>
    </div>
  );
};

export default memo(LeftMainHeader);
