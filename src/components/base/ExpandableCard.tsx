import { useState } from 'react';
import { Box, Paper, Typography, Collapse } from '@mui/material';
import IconifyIcon from './IconifyIcon';
import { cardHoverStyles } from 'theme/mixins';

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  expandedContent: React.ReactNode;
  children: React.ReactNode;
}

const ExpandableCard = ({
  title,
  subtitle,
  icon,
  iconBgColor,
  expandedContent,
  children,
}: ExpandableCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        ...cardHoverStyles,
      }}
    >
      {/* Header - Clickable */}
      <Box
        component="button"
        type="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          textAlign: 'left',
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          '&:hover': {
            // bgcolor: 'action.hover',
          },
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
        }}
      >
        {/* Left: Icon + Title/Subtitle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: iconBgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconifyIcon icon={icon} sx={{ fontSize: 20, color: 'white' }} />
          </Box>

          {/* Title and Subtitle */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              component="h3"
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Right: Expand/Collapse Icon */}
        <Box
          component="div"
          sx={{
            ml: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            color: 'text.secondary',
            pointerEvents: 'none', // Prevent interaction since parent button handles click
          }}
        >
          <IconifyIcon
            icon="mdi:chevron-down"
            sx={{
              fontSize: 20,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      </Box>

      {/* Collapsed Content - Always visible */}
      <Box sx={{ px: 2, pb: expanded ? 1.5 : 1.5 }}>
        {children}
      </Box>

      {/* Expanded Content - Shows below collapsed content when expanded */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            px: 2,
            py: 2,
          }}
        >
          {expandedContent}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ExpandableCard;

