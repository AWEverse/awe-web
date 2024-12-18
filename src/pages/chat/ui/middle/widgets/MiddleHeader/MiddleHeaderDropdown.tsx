import { FC, memo, useState } from 'react';
import useLastCallback from '@/lib/hooks/events/useLastCallback';
import {
  MoreVert,
  VolumeDown,
  PinDrop,
  Block,
  Archive,
  Delete,
  Report,
  SearchRounded,
} from '@mui/icons-material';
import s from './MiddleHeaderDropdown.module.scss';
import { withStateProps } from '@/lib/core';
import buildClassName from '@/shared/lib/buildClassName';
import Modal from '@/shared/ui/Modal';
import ConfirmActionModal from '@/entities/ConfirmActionModal';
import DropdownMenu, { TriggerProps } from '@/shared/ui/DropdownMenu';
import { Button } from '@mui/material';
import IconButton from '@/shared/ui/IconButton';
import { useIntl } from 'react-intl';
import ChatActionButton from '../../common/ChatActionButton';
import ReportModal from '@/entities/ReportModal';
import useChatStore from '@/pages/chat/store/useChatSelector';

interface OwnProps {
  className?: string;
}

interface StateProps {
  isGroup: boolean;
  isChannel: boolean;
  isPrivate: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isHidden: boolean;
}

type ModalAction =
  | 'search'
  | 'pin'
  | 'archive'
  | 'hide'
  | 'mute'
  | 'block'
  | 'delete'
  | 'report'
  | 'none';

const MiddleHeaderDropdown: FC<OwnProps & StateProps> = ({
  className,
  isMuted,
  isBlocked,
  isPinned,
  isArchived,
  isHidden,
  isGroup,
  isChannel,
}) => {
  const [currentModal, setModal] = useState<ModalAction>('none');

  const closeModal = useLastCallback(() => setModal('none'));
  const toggleChatSearching = useChatStore(state => state.toggleChatSearching);

  const handleAction = useLastCallback((action: ModalAction) => () => {
    setModal(action);
  });

  const lang = useIntl();

  const baseAction = lang.formatMessage(
    {
      id: 'confirm.action',
    },
    { action: currentModal },
  );

  const TriggerButton: FC<TriggerProps> = ({ isOpen, onTrigger }) => (
    <IconButton
      active={isOpen}
      className={buildClassName(s.TriggerButton, className)}
      size="medium"
      onClick={onTrigger}
    >
      <MoreVert />
    </IconButton>
  );

  return (
    <>
      <DropdownMenu
        className={buildClassName(className)}
        position="top-right"
        shouldClose={currentModal !== 'none'}
        triggerButton={TriggerButton}
      >
        <p className={s.SingleSectionTitle}>Chat Actions</p>

        <ChatActionButton
          className="Search_Hidden"
          icon={<SearchRounded />}
          isToggled={false}
          labelOff="Close Search"
          labelOn="Search"
          onClick={toggleChatSearching}
        />
        <ChatActionButton
          icon={<VolumeDown />}
          isToggled={isMuted}
          labelOff="Unmute chat"
          labelOn="Mute chat"
        />
        <ChatActionButton
          icon={<PinDrop />}
          isToggled={isPinned}
          labelOff="Unpin chat"
          labelOn="Pin chat"
        />
        <ChatActionButton
          icon={<Block />}
          isToggled={isBlocked}
          labelOff="Unblock chat"
          labelOn="Block chat"
        />
        <ChatActionButton
          icon={<Archive />}
          isToggled={isArchived}
          labelOff="Unarchive chat"
          labelOn="Archive chat"
        />
        <ChatActionButton
          icon={<Archive />}
          isToggled={isHidden}
          labelOff="Show chat"
          labelOn="Hide chat"
        />

        {isGroup || isChannel ? (
          <ChatActionButton
            icon={<Delete />}
            isToggled={false}
            labelOff="Delete chat"
            labelOn="Delete chat"
          />
        ) : null}

        <p className={s.SingleSectionTitle}>Chat Options</p>
        <ChatActionButton
          icon={<Report />}
          isToggled={false}
          labelOff="Report chat"
          labelOn="Report chat"
          onClick={handleAction('report')}
        />
      </DropdownMenu>

      <ReportModal isOpen={currentModal === 'report'} onClose={closeModal} />
    </>
  );
};

export default memo(
  withStateProps(
    (): StateProps => ({
      isGroup: false,
      isChannel: false,
      isPrivate: true,
      isMuted: false,
      isBlocked: false,
      isPinned: false,
      isArchived: false,
      isHidden: false,
    }),
  )(MiddleHeaderDropdown),
);
export type { OwnProps as MiddleHeaderDropdownProps };
