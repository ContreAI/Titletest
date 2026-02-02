import { Typography, Link } from '@mui/material';
import Grid from '@mui/material/Grid';

interface DocumentCardHeaderProps {
  documentName: string;
  documentUrl?: string;
}

const DocumentCardHeader = ({ documentName, documentUrl }: DocumentCardHeaderProps) => {
  return (
    <Grid size={12}>
      {documentUrl ? (
        <Link
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            color: 'text.primary',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600, 
              display: 'inline',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {documentName}
          </Typography>
        </Link>
      ) : (
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          {documentName}
        </Typography>
      )}
    </Grid>
  );
};

export default DocumentCardHeader;

