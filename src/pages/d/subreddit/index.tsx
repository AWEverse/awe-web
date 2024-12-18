import { Box } from '@mui/material';
import LeftColumn from './ui/LeftColumn';
import RightColumn from './ui/RightColumn';

const SubRedditPage = () => {
  return (
    <div className="p-4 flex">
      <Box sx={{ overflow: { xs: 'hidden', sm: 'auto' } }}>
        <LeftColumn />
      </Box>
      <Box sx={{ overflow: { xs: 'hidden', sm: 'auto' } }}>
        <RightColumn />
      </Box>
    </div>
  );
};

export default SubRedditPage;
