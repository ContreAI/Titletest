import { Box, Typography, Button, Stack } from '@mui/material';
import AvatarDropBox from 'components/base/AvatarDropBox';

interface BrandLogoProps {
  logoPreview: string | null;
  onLogoChange: (file: File) => void;
  onLogoRemove: () => void;
}

const BrandLogo = ({ logoPreview, onLogoChange, onLogoRemove }: BrandLogoProps) => {
  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onLogoChange(acceptedFiles[0]);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.elevation1',
        borderRadius: 2,
        p: 3.75, // 30px
        display: 'flex',
        alignItems: 'flex-start',
        gap: 3, // 24px
      }}
    >
      <AvatarDropBox
        onDrop={handleDrop}
        defaultFile={logoPreview || undefined}
        maxSize={2 * 1024 * 1024} // 2MB
        sx={{
          width: 80,
          height: 80,
          flexShrink: 0,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontFamily: (theme) => theme.typography.fontFamily,
              fontWeight: 600,
              fontSize: '1.125rem',
              mb: 0.5,
            }}
          >
            Brand Logo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your company logo. PNG or JPG, max 2MB.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            component="label"
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontFamily: (theme) => theme.typography.fontFamily,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              px: 2, // 16px
              py: 1.625, // 13px
              '&:hover': {
                bgcolor: 'action.hover',
                borderColor: 'divider',
              },
            }}
          >
            Change
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onLogoChange(file);
                }
              }}
            />
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onLogoRemove}
            sx={{
              textTransform: 'none',
              fontFamily: (theme) => theme.typography.fontFamily,
              color: 'error.main',
              bgcolor: 'error.lighter',
              border: 1,
              borderColor: (theme) => theme.palette.mode === 'light' 
                ? `rgba(${theme.palette.error.mainChannel} / 0.5)`
                : `rgba(${theme.palette.error.mainChannel} / 0.3)`,
              px: 2, // 16px
              py: 1.625, // 13px
              '&:hover': {
                bgcolor: 'error.light',
                borderColor: (theme) => theme.palette.mode === 'light'
                  ? `rgba(${theme.palette.error.mainChannel} / 0.5)`
                  : `rgba(${theme.palette.error.mainChannel} / 0.3)`,
              },
            }}
          >
            Remove
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default BrandLogo;

