import Modal, { ModalProps } from '@/shared/ui/Modal';
import { FC, memo } from 'react';
import PhoneCall from '../../calls/phone/PhoneCall';

import s from './CallModal.module.scss';
import buildClassName from '@/shared/lib/buildClassName';

type OwnProps = {
  callId?: string;
} & ModalProps;

const CallModal: FC<OwnProps> = ({ className, ...modalProps }) => {
  return (
    <Modal className={buildClassName(s.CallModalRoot, className)} {...modalProps}>
      <PhoneCall />
    </Modal>
  );
};

export default memo(CallModal);
