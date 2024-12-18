import { Suspense, lazy, FC } from 'react';
import { MiddleHeaderDropdownProps } from './MiddleHeaderDropdown';
const MiddleHeaderDropdown = lazy(() => import('./MiddleHeaderDropdown'));

const SuspensePlaceholder = () => <div>Loading...</div>;

const MiddleHeaderDropdownAsync: FC<MiddleHeaderDropdownProps> = props => (
  <Suspense fallback={<SuspensePlaceholder />}>
    <MiddleHeaderDropdown {...props} />
  </Suspense>
);

export default MiddleHeaderDropdownAsync;
