import { AppBar, Box, IconButton, Toolbar, Typography, useTheme, Chip } from '@mui/material';
import { HelpCircle, LogOut, Settings, ExternalLink } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { usePortalAuthStore } from 'modules/portal-auth/store/portal-auth.store';
import { PortalSide, PortalTransaction } from 'modules/portal/types/portal.types';

interface PortalHeaderProps {
  transaction?: PortalTransaction;
  titleCompanyLogo?: string;
  titleCompanyName?: string;
}

const HEADER_HEIGHT = 64;

const PortalHeader = ({ transaction, titleCompanyLogo, titleCompanyName }: PortalHeaderProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();
  const { logout } = usePortalAuthStore();

  const handleLogout = () => {
    if (transactionId && side) {
      logout(transactionId, side as PortalSide);
      navigate(`/${transactionId}/${side}/login`);
    }
  };

  const propertyAddress = transaction?.property
    ? `${transaction.property.address}, ${transaction.property.city} ${transaction.property.state}`
    : 'Loading...';

  const sideLabel = side === 'buyer' ? 'Buyer Agent' : 'Seller Agent';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          px: { xs: 2, sm: 3 },
          gap: 2,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {titleCompanyLogo ? (
            <Box
              component="img"
              src={titleCompanyLogo}
              alt={titleCompanyName || 'Title Company'}
              sx={{ height: 32, width: 'auto' }}
            />
          ) : (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                letterSpacing: '-0.5px',
              }}
            >
              {titleCompanyName || 'Contre Title'}
            </Typography>
          )}
        </Box>

        {/* Divider */}
        <Box
          sx={{
            width: 1,
            height: 24,
            bgcolor: theme.palette.divider,
            display: { xs: 'none', sm: 'block' },
          }}
        />

        {/* Property Address - Center */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: { xs: 'none', md: 'block' },
            }}
          >
            {propertyAddress}
          </Typography>

          {/* Side Badge */}
          <Chip
            label={sideLabel}
            size="small"
            sx={{
              bgcolor: side === 'buyer' ? 'primary.light' : 'secondary.light',
              color: side === 'buyer' ? 'primary.dark' : 'secondary.dark',
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24,
              display: { xs: 'none', sm: 'flex' },
            }}
          />
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { bgcolor: theme.palette.action.hover },
            }}
            title="Help"
          >
            <HelpCircle size={20} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { bgcolor: theme.palette.action.hover },
            }}
            title="Settings"
          >
            <Settings size={20} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { bgcolor: theme.palette.action.hover },
              display: { xs: 'none', sm: 'flex' },
            }}
            title="Open in new tab"
          >
            <ExternalLink size={20} />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { bgcolor: theme.palette.error.light, color: theme.palette.error.main },
            }}
            title="Sign Out"
          >
            <LogOut size={20} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default PortalHeader;
export { HEADER_HEIGHT };
