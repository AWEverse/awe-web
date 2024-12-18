// AsyncConfirmActionModal.tsx
import { FC, Suspense, lazy } from 'react';
import type { ConfirmActionModalProps } from './ConfirmActionModal';

const ConfirmActionModal = lazy(() => import('./ConfirmActionModal'));

const SuspensePlaceholder = () => <div>Loading...</div>;

const ConfirmActionModalAsync: FC<ConfirmActionModalProps> = props => (
  <Suspense fallback={<SuspensePlaceholder />}>
    <ConfirmActionModal {...props} />
  </Suspense>
);

export default ConfirmActionModalAsync;
