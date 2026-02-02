/**
 * Document Card
 *
 * Displays a single document with:
 * - Document name and type
 * - Processing status
 * - Action status (sign, review, etc.)
 * - Action buttons (view, download, etc.)
 */

import { Box, Card, CardContent, Chip, Stack, Typography, IconButton, Button, useTheme } from '@mui/material';
import { FileText, Download, Eye, MoreVertical, PenTool, Upload } from 'lucide-react';
import { PortalDocumentWithAction, ProcessingStatus, DocumentActionStatus, DocumentCategory } from 'modules/portal/types/portal.types';

interface DocumentCardProps {
  document: PortalDocumentWithAction;
  onView?: (doc: PortalDocumentWithAction) => void;
  onDownload?: (doc: PortalDocumentWithAction) => void;
  onSign?: (doc: PortalDocumentWithAction) => void;
  onUpload?: () => void;
  onMore?: (doc: PortalDocumentWithAction) => void;
}

const getProcessingStatusColor = (status: ProcessingStatus) => {
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

const getActionStatusInfo = (actionStatus: DocumentActionStatus) => {
  switch (actionStatus) {
    case 'complete':
      return { label: 'Complete', color: 'success' as const };
    case 'review_required':
      return { label: 'Review Required', color: 'warning' as const };
    case 'sign_required':
      return { label: 'Signature Required', color: 'error' as const };
    case 'upload_needed':
      return { label: 'Upload Needed', color: 'error' as const };
    case 'pending_from_title':
      return { label: 'Pending from Title', color: 'info' as const };
    case 'pending_from_lender':
      return { label: 'Pending from Lender', color: 'info' as const };
    default:
      return { label: 'Pending', color: 'default' as const };
  }
};

const getCategoryColor = (category: DocumentCategory) => {
  switch (category) {
    case 'contract':
      return 'primary';
    case 'title':
      return 'secondary';
    case 'financial':
      return 'success';
    case 'closing':
      return 'warning';
    case 'due_diligence':
      return 'info';
    default:
      return 'default';
  }
};

const DocumentCard = ({ document, onView, onDownload, onSign, onUpload, onMore }: DocumentCardProps) => {
  const theme = useTheme();
  const actionInfo = getActionStatusInfo(document.actionStatus);

  const isDisabled = document.processing.status === 'pending' || document.processing.status === 'processing';
  const needsSignature = document.actionStatus === 'sign_required';
  const needsUpload = document.actionStatus === 'upload_needed';

  // Determine icon color based on action status
  const getIconColor = () => {
    if (needsSignature) return theme.palette.error.main;
    if (document.actionStatus === 'review_required') return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  const getIconBgColor = () => {
    if (needsSignature) return theme.palette.error.light;
    if (document.actionStatus === 'review_required') return theme.palette.warning.light;
    return theme.palette.primary.light;
  };

  return (
    <Card>
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
                bgcolor: getIconBgColor(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {needsSignature ? (
                <PenTool size={20} color={getIconColor()} />
              ) : (
                <FileText size={20} color={getIconColor()} />
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body1" fontWeight={500} noWrap>
                {document.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {document.uploadedAt ? `Uploaded ${document.uploadedAt}` : 'Not yet received'}
              </Typography>
            </Box>
          </Box>

          {/* Status Badges */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, display: { xs: 'none', sm: 'flex' } }}>
            <Chip
              label={actionInfo.label}
              size="small"
              color={actionInfo.color}
              sx={{ height: 24 }}
            />
            {document.processing.status !== 'pending' && (
              <Chip
                label={document.processing.status}
                size="small"
                color={getProcessingStatusColor(document.processing.status)}
                variant="outlined"
                sx={{ height: 24 }}
              />
            )}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {needsSignature && onSign ? (
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<PenTool size={16} />}
                onClick={() => onSign(document)}
              >
                Sign
              </Button>
            ) : needsUpload && onUpload ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Upload size={16} />}
                onClick={onUpload}
              >
                Upload
              </Button>
            ) : (
              <>
                <IconButton
                  size="small"
                  title="View"
                  disabled={isDisabled}
                  onClick={() => onView?.(document)}
                >
                  <Eye size={18} />
                </IconButton>
                <IconButton
                  size="small"
                  title="Download"
                  disabled={isDisabled}
                  onClick={() => onDownload?.(document)}
                >
                  <Download size={18} />
                </IconButton>
              </>
            )}
            <IconButton
              size="small"
              title="More options"
              onClick={() => onMore?.(document)}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
