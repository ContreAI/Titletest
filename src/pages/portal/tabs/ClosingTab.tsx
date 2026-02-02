/**
 * Closing Tab
 *
 * Displays closing-related documents and signing info:
 * - Closing Disclosure
 * - Signing appointment details
 * - Final documents
 */

import { Box, Card, CardContent, Chip, Stack, Typography, Button, IconButton, useTheme, Alert, Divider } from '@mui/material';
import { FileText, Download, Eye, MoreVertical, Upload, Calendar, MapPin, Clock, PenTool, CheckCircle } from 'lucide-react';

// Mock closing documents
const mockDocuments = [
  {
    id: '1',
    name: 'Closing Disclosure',
    type: 'closing_disclosure',
    status: 'processed',
    uploadedAt: '2024-12-22',
    actionStatus: 'sign_required',
  },
  {
    id: '2',
    name: 'Wire Instructions',
    type: 'wire_instructions',
    status: 'processed',
    uploadedAt: '2024-12-20',
    actionStatus: 'review_required',
  },
  {
    id: '3',
    name: 'Title Policy',
    type: 'title_policy',
    status: 'pending',
    uploadedAt: '',
    actionStatus: 'pending_from_title',
  },
];

// Mock signing info
const mockSigning = {
  status: 'confirmed',
  method: 'in_person',
  dateTime: '2025-01-15 10:00 AM',
  location: 'Contre Title Office, 456 Title Ave, Boise ID 83702',
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

const getSigningStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', color: 'success' as const, icon: CheckCircle };
    case 'requested':
      return { label: 'Requested', color: 'warning' as const, icon: Clock };
    case 'awaiting_selection':
      return { label: 'Select Time', color: 'info' as const, icon: Calendar };
    default:
      return { label: 'Not Scheduled', color: 'default' as const, icon: Calendar };
  }
};

const ClosingTab = () => {
  const theme = useTheme();
  const signingInfo = getSigningStatusInfo(mockSigning.status);
  const SigningIcon = signingInfo.icon;

  // Check if signing is required
  const hasSignatureRequired = mockDocuments.some((doc) => doc.actionStatus === 'sign_required');

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Closing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Closing disclosure and signing details
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Upload size={18} />}>
          Upload Document
        </Button>
      </Box>

      {/* Signing Alert */}
      {hasSignatureRequired && (
        <Alert
          severity="error"
          icon={<PenTool size={20} />}
          action={
            <Button color="inherit" size="small" startIcon={<PenTool size={16} />}>
              Sign Now
            </Button>
          }
          sx={{ mb: 3 }}
        >
          You have documents that require your signature. Please review and sign to proceed with closing.
        </Alert>
      )}

      {/* Signing Appointment Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h6">Signing Appointment</Typography>
                <Chip
                  icon={<SigningIcon size={14} />}
                  label={signingInfo.label}
                  size="small"
                  color={signingInfo.color}
                />
              </Stack>

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Calendar size={18} color={theme.palette.text.secondary} />
                  <Typography variant="body2">{mockSigning.dateTime}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MapPin size={18} color={theme.palette.text.secondary} />
                  <Typography variant="body2">{mockSigning.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PenTool size={18} color={theme.palette.text.secondary} />
                  <Typography variant="body2">
                    {mockSigning.method === 'in_person'
                      ? 'In-Person Signing'
                      : mockSigning.method === 'mobile_notary'
                        ? 'Mobile Notary'
                        : 'Remote Online Notarization (RON)'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Button variant="outlined" startIcon={<Calendar size={18} />}>
              Reschedule
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Closing Documents
      </Typography>

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
                        bgcolor:
                          doc.actionStatus === 'sign_required'
                            ? theme.palette.error.light
                            : theme.palette.warning.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {doc.actionStatus === 'sign_required' ? (
                        <PenTool
                          size={20}
                          color={theme.palette.error.main}
                        />
                      ) : (
                        <FileText
                          size={20}
                          color={theme.palette.warning.main}
                        />
                      )}
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
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    {doc.actionStatus === 'sign_required' ? (
                      <Button size="small" variant="contained" color="error" startIcon={<PenTool size={16} />}>
                        Sign
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

export default ClosingTab;
