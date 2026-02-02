import { ReactNode } from 'react';
import { Box, Typography, Stack, SxProps, Theme } from '@mui/material';
import PageBreadcrumb, { PageBreadcrumbItem } from 'components/sections/common/PageBreadcrumb';

export interface PageHeaderProps {
  /**
   * Breadcrumb navigation items
   */
  breadcrumbs?: PageBreadcrumbItem[];
  /**
   * Page title (h1)
   */
  title: string;
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  /**
   * Action buttons area (right side)
   */
  actions?: ReactNode;
  /**
   * Additional styles for the container
   */
  sx?: SxProps<Theme>;
}

/**
 * Unified page header component with consistent structure:
 * - Breadcrumb navigation
 * - Page title (h1)
 * - Optional subtitle
 * - Action buttons area
 */
const PageHeader = ({
  breadcrumbs,
  title,
  subtitle,
  actions,
  sx,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 3.75,
        pb: 3.75,
        px: 3.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Stack spacing={1.5}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <PageBreadcrumb items={breadcrumbs} />
        )}

        {/* Title and Actions Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          {/* Title and Subtitle */}
          <Box>
            <Typography variant="h2" component="h1" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          {actions && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {actions}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default PageHeader;
