import DropdownMenu, { TriggerProps } from '@/shared/ui/DropdownMenu';
import { ExpandMoreRounded, SendRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FC } from 'react';
import IconButton from '@/shared/ui/IconButton';
import s from './InputButton.module.scss';

const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
  <IconButton active={isOpen} aria-pressed={isOpen} className={s.chatOption} onClick={onTrigger}>
    <ExpandMoreRounded className={s.expandIcon} />
  </IconButton>
);

const InputButton: FC = () => {
  return (
    <section className={s.InputButton}>
      <DropdownMenu position="bottom-right" triggerButton={TriggerButton}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis porro quibusdam magnam
        facere. Sunt dolorum laborum sit molestiae voluptates similique eos nihil vero aperiam,
        mollitia quasi quod iure aut accusamus?
      </DropdownMenu>

      <Button className={s.sendButton}>
        <SendRounded />
      </Button>
    </section>
  );
};

export default InputButton;
