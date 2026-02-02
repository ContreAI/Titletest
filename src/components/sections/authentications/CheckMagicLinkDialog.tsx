import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  paperClasses,
} from '@mui/material';
import illustration8dark from 'assets/images/illustrations/8-dark.webp';
import illustration8 from 'assets/images/illustrations/8-light.webp';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

interface CheckMagicLinkDialogProps {
  open: boolean;
  handleClose: () => void;
  email: string;
  time: number;
  handleSendAgain: () => void;
}

const CheckMagicLinkDialog = ({
  open,
  handleClose,
  email,
  time,
  handleSendAgain,
}: CheckMagicLinkDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      sx={{
        [`& .${paperClasses.root}`]: {
          borderRadius: 4,
          maxWidth: 515,
        },
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 5 }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 32,
            top: 24,
          }}
        >
          <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
        </IconButton>
        <Stack
          sx={{
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Image
            src={{ light: illustration8, dark: illustration8dark }}
            alt=""
            width={320}
            height={240}
          />
        </Stack>
        <DialogTitle sx={{ typography: 'h5', fontWeight: 500 }}>Check your mailbox!</DialogTitle>
        <DialogContentText sx={{ typography: 'body1', color: 'text.primary' }}>
          We&apos;ve sent a magic link to{' '}
          <Box component="span" sx={{ fontWeight: 500 }}>
            {email}
          </Box>
          . Click the link in the email to sign in instantly.
        </DialogContentText>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The link will expire in 1 hour. If you don&apos;t see the email, check your spam folder.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 5, pt: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          Didn&apos;t receive the email?{' '}
          <Link
            href="#!"
            onClick={(e) => {
              e.preventDefault();
              handleSendAgain();
            }}
            sx={[time > 0 && { pointerEvents: 'none', color: 'text.disabled' }]}
          >
            Send again
            {time > 0 ? ` in ${time}s` : ''}
          </Link>
        </Typography>
      </DialogActions>
    </Dialog>
  );
};

export default CheckMagicLinkDialog;
