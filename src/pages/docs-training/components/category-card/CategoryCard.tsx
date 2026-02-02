import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { cardHoverStyles } from 'theme/mixins';
import type { DocumentCategory } from '../../data/categoriesData';

// Simple template interface for display
interface TrainedTemplate {
  id: string;
  name: string;
  fieldCount: number;
}

interface CategoryCardProps {
  category: DocumentCategory;
  templates?: TrainedTemplate[];
  onClick?: (category: DocumentCategory) => void;
}

const getIconColorScheme = (scheme: 'primary' | 'info' | 'neutral') => {
  switch (scheme) {
    case 'primary':
      return { bgColor: 'success.lighter', iconColor: 'success.main' };
    case 'info':
      return { bgColor: 'info.lighter', iconColor: 'info.main' };
    case 'neutral':
    default:
      return { bgColor: 'action.hover', iconColor: 'text.secondary' };
  }
};

const CategoryCard = ({ category, templates = [], onClick }: CategoryCardProps) => {
  const iconScheme = getIconColorScheme(category.iconColorScheme);
  const hasTemplates = templates.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(category);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(category)}
      onKeyDown={handleKeyDown}
      sx={{
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: !hasTemplates ? '2px dashed' : '1px solid',
        borderColor: !hasTemplates ? 'divider' : 'divider',
        bgcolor: !hasTemplates ? 'background.neutral' : 'background.paper',
        ...cardHoverStyles,
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Stack spacing={2} sx={{ flex: 1 }} direction="column">
          {/* Icon and Status Row */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: iconScheme.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !hasTemplates ? 0.6 : 1,
              }}
            >
              <IconifyIcon icon={category.icon} sx={{ fontSize: 24, color: iconScheme.iconColor }} />
            </Box>
            <Chip
              label={hasTemplates ? `${templates.length} Template${templates.length > 1 ? 's' : ''}` : 'Empty'}
              size="small"
              sx={{
                bgcolor: hasTemplates ? 'success.lighter' : 'action.hover',
                color: hasTemplates ? 'success.main' : 'text.secondary',
                fontWeight: 600,
                height: 24,
                fontSize: '0.7rem',
                border: 'none',
                '& .MuiChip-label': {
                  px: 1,
                  fontWeight: 600,
                },
              }}
            />
          </Stack>

          {/* Title and Description */}
          <Stack spacing={1} sx={{ flex: 1 }} direction={"column"}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: !hasTemplates ? 'text.disabled' : 'text.primary' }}>
              {category.title}
            </Typography>
            <Typography variant="body2" sx={{ color: !hasTemplates ? 'text.disabled' : 'text.secondary', lineHeight: 1.6 }}>
              {category.description}
            </Typography>
          </Stack>

          {/* Trained Templates List */}
          {hasTemplates && (
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase' }}>
                Trained Templates
              </Typography>
              <Stack spacing={0.5}>
                {templates.slice(0, 3).map((template) => (
                  <Stack key={template.id} direction="row" alignItems="center" spacing={1}>
                    <IconifyIcon icon="material-symbols:check-circle" sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {template.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      {template.fieldCount} fields
                    </Typography>
                  </Stack>
                ))}
                {templates.length > 3 && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    +{templates.length - 3} more
                  </Typography>
                )}
              </Stack>
            </Stack>
          )}

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: !hasTemplates ? 'text.disabled' : 'text.secondary', fontStyle: !hasTemplates ? 'italic' : 'normal' }}>
              {hasTemplates ? 'Click to add more templates' : 'Click to upload documents'}
            </Typography>
            <IconifyIcon
              icon={!hasTemplates ? "material-symbols:upload" : "material-symbols:add"}
              sx={{ fontSize: 16, color: !hasTemplates ? 'text.disabled' : 'text.secondary' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;

