/**
 * Title Tab
 *
 * Displays title-related documents:
 * - Title Commitment
 * - Preliminary Title Report
 * - Deed
 * - Title Policy
 */

import { Box, Card, CardContent, Chip, Stack, Typography, Button, IconButton, useTheme, Alert } from '@mui/material';
import { FileText, Download, Eye, MoreVertical, Upload, AlertTriangle } from 'lucide-react';

// Mock title documents
const mockDocuments = [
  {
    id: '1',
    name: 'Title Commitment',
    type: 'title_commitment',
    status: 'processed',
    uploadedAt: '2024-12-15',
    actionStatus: 'review_required',
    hasReport: true,
  },
  {
    id: '2',
    name: 'Preliminary Title Report',
    type: 'preliminary_title_report',
    status: 'processed',
    uploadedAt: '2024-12-10',
    actionStatus: 'complete',
    hasReport: true,
  },
  {
    id: '3',
    name: 'Deed',
    type: 'deed',
    status: 'pending',
    uploadedAt: '',
    actionStatus: 'pending_from_title',
    hasReport: false,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processed':
      return 'success';
    case 'processing':
      return 'warning';
    case 'pending':
      return 'default';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const getActionStatusLabel = (actionStatus: string) => {
  switch (actionStatus) {
    case 'complete':
      return { label: 'Complete', color: 'success' as const };
    case 'review_required':
      return { label: 'Review Required', color: 'warning' as const };
    case 'sign_required':
      return { label: 'Signature Required', color: 'error' as const };
    case 'pending_from_title':
      return { label: 'Pending from Title', color: 'info' as const };
    default:
      return { label: 'Pending', color: 'default' as const };
  }
};

const TitleTab = () => {
  const theme = useTheme();

  // Check if there are any items requiring attention
  const requiresAttention = mockDocuments.some(
    (doc) => doc.actionStatus === 'review_required' || doc.actionStatus === 'sign_required'
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Title Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Title commitment, reports, and closing documents
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Upload size={18} />}>
          Upload Document
        </Button>
      </Box>

      {/* Alert for items requiring attention */}
      {requiresAttention && (
        <Alert
          severity="warning"
          icon={<AlertTriangle size={20} />}
          sx={{ mb: 3 }}
        >
          You have title documents that require your review. Please review them at your earliest convenience.
        </Alert>
      )}

      {/* Documents List */}
      <Stack spacing={2}>
        {mockDocuments.map((doc) => {
          const actionInfo = getActionStatusLabel(doc.actionStatus);

          return (
            <Card key={doc.id}>
              <CardContent sx={{ py: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  {/* Document Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: theme.palette.secondary.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} color={theme.palette.secondary.main} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={500} noWrap>
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.uploadedAt ? `Uploaded ${doc.uploadedAt}` : 'Not yet received'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Status Badges */}
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Chip
                      label={actionInfo.label}
                      size="small"
                      color={actionInfo.color}
                      sx={{ height: 24 }}
                    />
                    {doc.hasReport && (
                      <Chip
                        label="Report Available"
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ height: 24 }}
                      />
                    )}
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <IconButton size="small" title="View" disabled={doc.status === 'pending'}>
                      <Eye size={18} />
                    </IconButton>
                    <IconButton size="small" title="Download" disabled={doc.status === 'pending'}>
                      <Download size={18} />
                    </IconButton>
                    <IconButton size="small" title="More options">
                      <MoreVertical size={18} />
                    </IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

export default TitleTab;
