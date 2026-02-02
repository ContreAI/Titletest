import { Card, CardContent, CircularProgress, Box, Typography } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { dashboardSpacing } from 'theme/spacing';
import { useNotificationStore } from 'modules/notifications/store/notification.store';
import ActivityTabs from './ActivityTabs';
import ActivitySearch from './ActivitySearch';
import ActivityList from './ActivityList';
import NotesList from './NotesList';

interface Activity {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: string;
}

// Map notification types to activity icons
const getActivityIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'document_uploaded': 'material-symbols:attach-file',
    'document_processed': 'material-symbols:check-circle',
    'document_failed': 'material-symbols:error-outline',
    'transaction_summary_ready': 'material-symbols:summarize',
    'transaction_report_ready': 'material-symbols:description',
    'agent_uploaded_document': 'material-symbols:upload-file',
    'agent_commented': 'material-symbols:comment',
    'transaction_status_changed': 'material-symbols:swap-horiz',
    'system_alert': 'material-symbols:notifications',
    'job_completed': 'material-symbols:check',
    'job_failed': 'material-symbols:close',
  };
  return iconMap[type] || 'material-symbols:notifications';
};

// Format time from ISO date string
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const Activities = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications, isLoading, fetchNotifications } = useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications().catch(console.error);
  }, [fetchNotifications]);

  // Convert notifications to activities
  const activities = useMemo((): Activity[] => {
    return notifications.map((notification) => ({
      id: notification.id,
      icon: getActivityIcon(notification.type),
      title: notification.title || notification.message || 'Activity',
      description: notification.message || `Type: ${notification.type}`,
      time: formatTime(notification.createdAt || new Date().toISOString()),
    }));
  }, [notifications]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredActivities = activities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardContent sx={{ p: dashboardSpacing.contentGapSm, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ActivityTabs activeTab={activeTab} onChange={handleTabChange} />
        
        {activeTab === 0 ? (
          <>
            <ActivitySearch value={searchQuery} onChange={setSearchQuery} />
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : filteredActivities.length > 0 ? (
              <ActivityList activities={filteredActivities} />
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No activities yet. Activities will appear here as documents are processed and transactions are updated.
                </Typography>
              </Box>
            )}
          </>
        ) : (
          <NotesList />
        )}
      </CardContent>
    </Card>
  );
};

export default Activities;

