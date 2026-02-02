/**
 * Financial Tab
 *
 * Displays financial documents:
 * - Loan Approval
 * - Appraisal
 * - Insurance Binder
 * - Settlement Statements
 */

import { Box, Card, CardContent, Chip, Stack, Typography, Button, IconButton, useTheme, LinearProgress } from '@mui/material';
import { FileText, Download, Eye, MoreVertical, Upload, DollarSign } from 'lucide-react';

// Mock financial documents
const mockDocuments = [
  {
    id: '1',
    name: 'Loan Approval Letter',
    type: 'loan_approval',
    status: 'processed',
    uploadedAt: '2024-12-12',
    actionStatus: 'complete',
    source: 'lender',
  },
  {
    id: '2',
    name: 'Appraisal Report',
    type: 'appraisal',
    status: 'processing',
    uploadedAt: '2024-12-18',
    actionStatus: 'pending_from_lender',
    source: 'lender',
  },
  {
    id: '3',
    name: 'Homeowners Insurance Binder',
    type: 'insurance_binder',
    status: 'pending',
    uploadedAt: '',
    actionStatus: 'upload_needed',
    source: 'buyer',
  },
  {
    id: '4',
    name: 'Settlement Statement (Buyer)',
    type: 'settlement_statement_buyer',
    status: 'pending',
    uploadedAt: '',
    actionStatus: 'pending_from_title',
    source: 'title',
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
    case 'upload_needed':
      return { label: 'Upload Needed', color: 'error' as const };
    case 'pending_from_lender':
      return { label: 'Pending from Lender', color: 'info' as const };
    case 'pending_from_title':
      return { label: 'Pending from Title', color: 'info' as const };
    default:
      return { label: 'Pending', color: 'default' as const };
  }
};

const FinancialTab = () => {
  const theme = useTheme();

  // Calculate completion stats
  const totalDocs = mockDocuments.length;
  const completedDocs = mockDocuments.filter((d) => d.actionStatus === 'complete').length;
  const completionPercent = (completedDocs / totalDocs) * 100;

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Financial Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loan, appraisal, and insurance documents
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Upload size={18} />}>
          Upload Document
        </Button>
      </Box>

      {/* Progress Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: theme.palette.success.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={24} color={theme.palette.success.main} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Financial Checklist Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercent}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {completedDocs}/{totalDocs} complete
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

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
                        bgcolor: theme.palette.success.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} color={theme.palette.success.main} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={500} noWrap>
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.uploadedAt ? `Uploaded ${doc.uploadedAt}` : `From ${doc.source}`}
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
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    {doc.actionStatus === 'upload_needed' ? (
                      <Button size="small" variant="outlined" startIcon={<Upload size={16} />}>
                        Upload
                      </Button>
                    ) : (
                      <>
                        <IconButton size="small" title="View" disabled={doc.status === 'pending'}>
                          <Eye size={18} />
                        </IconButton>
                        <IconButton size="small" title="Download" disabled={doc.status === 'pending'}>
                          <Download size={18} />
                        </IconButton>
                      </>
                    )}
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

export default FinancialTab;
