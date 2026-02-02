/**
 * Format dates for display in deal details
 */
export const formatDate = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

