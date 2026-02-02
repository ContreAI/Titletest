/**
 * Contract Tab
 *
 * Displays contract-related documents:
 * - Purchase Agreement
 * - Addendums
 * - Earnest Money Receipt
 */

import { Box, Card, CardContent, CardHeader, Chip, Stack, Typography, Button, IconButton, useTheme } from '@mui/material';
import { FileText, Download, Eye, MoreVertical, Upload } from 'lucide-react';

// Mock contract documents
const mockDocuments = [
  {
    id: '1',
    name: 'Purchase Agreement',
    type: 'purchase_agreement',
    status: 'processed',
    uploadedAt: '2024-12-01',
    actionStatus: 'complete',
  },
  {
    id: '2',
    name: 'Addendum - Inspection Extension',
    type: 'addendum',
    status: 'processed',
    uploadedAt: '2024-12-10',
    actionStatus: 'review_required',
  },
  {
    id: '3',
    name: 'Earnest Money Receipt',
    type: 'earnest_money_receipt',
    status: 'processed',
    uploadedAt: '2024-12-02',
    actionStatus: 'complete',
  },
  {
    id: '4',
    name: 'Addendum - Price Reduction',
    type: 'addendum',
    status: 'pending',
    uploadedAt: '2024-12-20',
    actionStatus: 'pending_from_seller',
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
    case 'pending_from_seller':
      return { label: 'Pending from Seller', color: 'info' as const };
    case 'pending_from_title':
      return { label: 'Pending from Title', color: 'info' as const };
    default:
      return { label: 'Pending', color: 'default' as const };
  }
};

const ContractTab = () => {
  const theme = useTheme();

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Contract Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Purchase agreement and related addendums
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Upload size={18} />}>
          Upload Document
        </Button>
      </Box>

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
                        bgcolor: theme.palette.primary.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} color={theme.palette.primary.main} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={500} noWrap>
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Uploaded {doc.uploadedAt}
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
                    <Chip
                      label={doc.status}
                      size="small"
                      color={getStatusColor(doc.status)}
                      variant="outlined"
                      sx={{ height: 24 }}
                    />
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <IconButton size="small" title="View">
                      <Eye size={18} />
                    </IconButton>
                    <IconButton size="small" title="Download">
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

      {/* Empty State */}
      {mockDocuments.length === 0 && (
        <Card>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <FileText size={48} color={theme.palette.text.disabled} style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Contract Documents Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Contract documents will appear here once uploaded.
            </Typography>
            <Button variant="contained" startIcon={<Upload size={18} />}>
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ContractTab;
