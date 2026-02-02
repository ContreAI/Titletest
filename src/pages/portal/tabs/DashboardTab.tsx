/**
 * Dashboard Tab
 *
 * Overview of the transaction including:
 * - Status board with pending items by party
 * - Upcoming deadlines
 * - Recent documents
 * - Quick actions
 */

import { Box, Card, CardContent, CardHeader, Chip, Grid, Stack, Typography, Button, useTheme } from '@mui/material';
import { Calendar, FileText, Upload, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router';

// Mock data for dashboard
const mockDeadlines = [
  { id: '1', title: 'Inspection Deadline', date: '2025-01-05', daysRemaining: 7 },
  { id: '2', title: 'Loan Approval', date: '2025-01-08', daysRemaining: 10 },
  { id: '3', title: 'Appraisal Due', date: '2025-01-10', daysRemaining: 12 },
  { id: '4', title: 'Closing Date', date: '2025-01-15', daysRemaining: 17 },
];

const mockRecentDocuments = [
  { id: '1', name: 'Purchase Agreement', type: 'contract', status: 'processed', uploadedAt: '2024-12-20' },
  { id: '2', name: 'Title Commitment', type: 'title', status: 'processing', uploadedAt: '2024-12-22' },
  { id: '3', name: 'Earnest Money Receipt', type: 'contract', status: 'processed', uploadedAt: '2024-12-21' },
];

const mockStatusItems = [
  { party: 'Title Co', pending: 2, completed: 5 },
  { party: 'Lender', pending: 3, completed: 2 },
  { party: 'Buyer', pending: 1, completed: 4 },
  { party: 'Seller', pending: 0, completed: 3 },
  { party: 'Agent', pending: 2, completed: 6 },
];

const DashboardTab = () => {
  const theme = useTheme();
  const { transactionId, side } = useParams<{ transactionId: string; side: string }>();

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your transaction progress
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Status Board */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Status Board"
              subheader="Track pending items by party"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Grid container spacing={2}>
                {mockStatusItems.map((item) => (
                  <Grid item xs={6} sm={4} md={2.4} key={item.party}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: theme.palette.action.hover,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {item.party}
                      </Typography>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Chip
                          icon={<AlertCircle size={14} />}
                          label={item.pending}
                          size="small"
                          color={item.pending > 0 ? 'warning' : 'default'}
                          sx={{ height: 24 }}
                        />
                        <Chip
                          icon={<CheckCircle2 size={14} />}
                          label={item.completed}
                          size="small"
                          color="success"
                          sx={{ height: 24 }}
                        />
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Quick Actions"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Upload size={18} />}
                  fullWidth
                >
                  Upload Document
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Calendar size={18} />}
                  fullWidth
                >
                  Schedule Signing
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  fullWidth
                >
                  View All Documents
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Coming Up"
              subheader="Next 4 deadlines"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {mockDeadlines.map((deadline) => (
                  <Box
                    key={deadline.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: deadline.daysRemaining <= 7 ? 'warning.light' : 'action.hover',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Clock
                        size={20}
                        color={deadline.daysRemaining <= 7 ? theme.palette.warning.main : theme.palette.text.secondary}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {deadline.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {deadline.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${deadline.daysRemaining} days`}
                      size="small"
                      color={deadline.daysRemaining <= 7 ? 'warning' : 'default'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Documents"
              subheader="Last 3 processed"
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {mockRecentDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FileText size={20} color={theme.palette.primary.main} />
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.uploadedAt}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={doc.status}
                      size="small"
                      color={doc.status === 'processed' ? 'success' : 'warning'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardTab;
