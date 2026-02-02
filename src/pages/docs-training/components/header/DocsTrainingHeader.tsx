import { Stack, Typography } from '@mui/material';

const DocsTrainingHeader = () => {
  return (
    <Stack spacing={1} direction={"column"} p={4} bgcolor={"background.paper"}>
      <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        DOCUMENTS & TRAINING HUB
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Manage your contracts, legal documents, and training materials
      </Typography>
    </Stack>
  );
};

export default DocsTrainingHeader;

