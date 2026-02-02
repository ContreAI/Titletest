import { Box, Button, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

interface TeamHeaderProps {
  onInvite: () => void;
  onBulkImport: () => void;
  canInvite: boolean;
}

const TeamHeader = ({ onInvite, onBulkImport, canInvite }: TeamHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={600}>
          Team Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your team members and invitations
        </Typography>
      </Box>

      {canInvite && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="mdi:file-upload-outline" />}
            onClick={onBulkImport}
          >
            Bulk Import
          </Button>
          <Button
            variant="contained"
            startIcon={<IconifyIcon icon="mdi:account-plus-outline" />}
            onClick={onInvite}
          >
            Invite Member
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TeamHeader;
