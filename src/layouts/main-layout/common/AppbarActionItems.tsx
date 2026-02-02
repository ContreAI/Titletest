import { ReactElement } from 'react';
import { Box, Stack, SxProps } from '@mui/material';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import ThemeToggler from './ThemeToggler';

interface AppbarActionItemsProps {
  type?: 'default' | 'slim';
  sx?: SxProps;
  searchComponent?: ReactElement;
}

const AppbarActionItems = ({ type = 'default', sx, searchComponent }: AppbarActionItemsProps) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: 'center',
        ml: 'auto',
        ...sx,
      }}
    >
      {searchComponent}
      <ThemeToggler type={type} />
      <NotificationMenu type={type} />
      <Box sx={{ width: 16 }} />
      <ProfileMenu type={type} />
    </Stack>
  );
};

export default AppbarActionItems;
