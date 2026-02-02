import { Link, Stack, Typography } from '@mui/material';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';

interface Document {
  name: string;
  filename: string;
  documentType?: string;
  documentUrl?: string;
  date: string;
}

interface DocumentTimelineItemProps {
  document: Document;
  isLast: boolean;
  onClick?: (doc: Document) => void;
}

const DocumentTimelineItem = ({ document, isLast, onClick }: DocumentTimelineItemProps) => {
  return (
    <TimelineItem sx={{ '&:before': { flex: 0, padding: 0 }, minHeight: 48 }}>
      <TimelineSeparator>
        <TimelineDot 
          sx={{ 
            width: 8,
            height: 8,
            bgcolor: 'primary.main',
            boxShadow: 'none',
            mt: 0.7,
            border: 'none',
          }} 
        />
        {!isLast && (
          <TimelineConnector sx={{ bgcolor: 'divider', width: '1px', ml: '0px' }} />
        )}
      </TimelineSeparator>
      <TimelineContent sx={{ mt: 0, py: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
          <Stack direction="column" spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Link
              href={document.documentUrl}
              target={document.documentUrl ? '_blank' : undefined}
              rel={document.documentUrl ? 'noopener noreferrer' : undefined}
              component={document.documentUrl ? 'a' : 'button'}
              variant="body2"
              onClick={document.documentUrl ? undefined : () => onClick?.(document)}
              underline="hover"
              sx={{
                textAlign: 'left',
                color: 'text.primary',
                fontWeight: 500,
                fontSize: '0.875rem',
                display: 'inline',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                p: 0,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {document.documentType || document.name}
            </Link>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              {document.filename || '<filename>'}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              fontSize: '0.875rem',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {document.date}
          </Typography>
        </Stack>
      </TimelineContent>
    </TimelineItem>
  );
};

export default DocumentTimelineItem;

