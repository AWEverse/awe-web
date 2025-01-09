import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const LayoutOutlet = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default LayoutOutlet;
