import { FC, memo, useState } from 'react';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import styles from './TagCheckbox.module.scss';
import RippleEffect from '@/shared/ui/ripple-effect';
import CheckIcon from '@mui/icons-material/Check';

interface TagCheckboxProps {
  name: string;
  checked?: boolean;
  handleCheckboxChange: (name: string, checked: boolean) => void;
}

const TagCheckbox: FC<TagCheckboxProps> = memo(props => {
  const { name, checked = false, handleCheckboxChange } = props;
  const [isChecked, setIsChecked] = useState(checked);

  const toggleCheckbox = useLastCallback(() => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    handleCheckboxChange(name, newChecked);
  });

  return (
    <div
      className={`${styles.chip} ${isChecked ? styles.checked : ''}`}
      role="button"
      tabIndex={0}
      onClick={toggleCheckbox}
    >
      {isChecked && <CheckIcon className={styles.icon} />}
      <p>{name}</p>
      <RippleEffect />
    </div>
  );
});

export default TagCheckbox;
