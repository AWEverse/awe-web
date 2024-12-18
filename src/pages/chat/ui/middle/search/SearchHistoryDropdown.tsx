import DropdownMenu, { TriggerProps } from '@/shared/ui/DropdownMenu';
import IconButton from '@/shared/ui/IconButton';
import { ManageSearchRounded } from '@mui/icons-material';
import { FC, memo, useMemo } from 'react';

interface OwnProps {}

interface StateProps {}

const SearchHistoryDropdown: FC<OwnProps & StateProps> = () => {
  const trigger: FC<TriggerProps> = useMemo(
    () =>
      ({ isOpen, onTrigger }) => {
        return (
          <IconButton active={isOpen} aria-pressed={isOpen} onClick={onTrigger} size="small">
            <ManageSearchRounded />
          </IconButton>
        );
      },
    [],
  );

  return (
    <DropdownMenu triggerButton={trigger} position="top-left">
      lfallfsal
    </DropdownMenu>
  );
};

export default memo(SearchHistoryDropdown);
