import { BoxProps, ListProps, Box, List, CircularProgress } from '@mui/material';
import { FC, ReactNode } from 'react';

interface ListWrapperProps {
  horizontal: boolean;
  refreshing: boolean;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  wrapperProps?: BoxProps;
  listProps?: ListProps;
  children: ReactNode;
  listClassName?: string;
  wrapperClassName?: string;
}

const ListWrapper: FC<ListWrapperProps> = ({
  horizontal,
  refreshing,
  ListHeaderComponent,
  ListFooterComponent,
  wrapperProps,
  listProps,
  children,
  listClassName,
  wrapperClassName,
}) => (
  <Box className={wrapperClassName} {...wrapperProps}>
    {ListHeaderComponent}
    <List
      className={listClassName}
      sx={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        gap: 0.5,
        flexWrap: 'wrap',
        ...listProps?.sx,
      }}
      {...listProps}
    >
      {children}
    </List>
    {refreshing && (
      <Box display="flex" justifyContent="center" my={2}>
        <CircularProgress />
      </Box>
    )}
    {ListFooterComponent}
  </Box>
);

export default ListWrapper;
