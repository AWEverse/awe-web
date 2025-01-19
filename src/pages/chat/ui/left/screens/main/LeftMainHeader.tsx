import { FC, useState, memo } from "react";
import s from "./LeftMainHeader.module.scss";
import SearchInput from "@/shared/ui/SearchInput";
import { useEvent } from "@/lib/hooks/callbacks/useStableCallbackSync";
import { ArrowForwardRounded } from "@mui/icons-material";
import useChatStore from "@/pages/chat/store/useChatSelector";
import IconButton from "@/shared/ui/IconButton";

interface OwnProps {
  onFocus?: () => void;
  onReset?: () => void;
  onBlur?: () => void;
}

interface StateProps {}

const useSearchInput = () => {
  const [value, setValue] = useState("");

  const handleChange = useEvent((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  });

  const handleReset = useEvent(() => {
    setValue("");
  });

  return { value, handleChange, handleReset };
};

const LeftMainHeader: FC<OwnProps & StateProps> = (props) => {
  const { onFocus, onBlur } = props;
  const handleClose = useChatStore((state) => state.closeChatList);

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
      <IconButton className={s.CloseButton} onClick={handleClose}>
        <ArrowForwardRounded />
      </IconButton>
    </div>
  );
};

export default memo(LeftMainHeader);
