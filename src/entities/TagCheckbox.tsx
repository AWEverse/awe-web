import { FC, memo, useState } from "react";
import styles from "./TagCheckbox.module.scss";
import RippleEffect from "@/shared/ui/ripple-effect";
import CheckIcon from "@mui/icons-material/Check";
import { useStableCallback } from "@/shared/hooks/base";

interface TagCheckboxProps {
  name: string;
  checked?: boolean;
  size?: "xs" | "sm" | "md" | "lg"; // Added size prop
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

const TagCheckbox: FC<TagCheckboxProps> = memo((props) => {
  const { name, checked = false, size = "md", handleCheckboxChange } = props;
  const [isChecked, setIsChecked] = useState(checked);

  const toggleCheckbox = useStableCallback(() => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    handleCheckboxChange(name, newChecked);
  });

  return (
    <div
      className={`${styles.chip} ${styles[size]} ${isChecked ? styles.checked : ""}`}
      role="button"
      tabIndex={0}
      onClick={toggleCheckbox}
    >
      {isChecked && <CheckIcon className={`${styles.icon} ${styles[size]}`} />}
      <p>{name}</p>
      <RippleEffect />
    </div>
  );
});

export default TagCheckbox;
