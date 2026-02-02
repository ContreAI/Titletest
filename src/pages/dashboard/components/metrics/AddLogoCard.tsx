import { useRef } from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { cardHoverStyles } from 'theme/mixins';

interface AddLogoCardProps {
  onClick?: () => void;
  onFileSelect?: (file: File) => void;
}

const AddLogoCard = ({ onClick, onFileSelect }: AddLogoCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Trigger file input click
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Paper
      elevation={0}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      sx={{
        px: 2,
        py: 1.5,
        height: '100%',
        minHeight: 80,
        cursor: 'pointer',
        borderRadius: 2,
        ...cardHoverStyles,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Stack spacing={2} direction="column">
        {/* Header: Icon + Title */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Stack
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              alignItems: 'center',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <IconifyIcon
              icon="material-symbols:add"
              sx={{
                fontSize: 20,
                color: 'text.primary',
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.primary">
            Add Company Logo
          </Typography>
        </Stack>

        {/* Click Here Link */}
        <Stack direction="row" spacing={1} >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            Click Here
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AddLogoCard;
