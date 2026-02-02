import { memo } from 'react';
import { NavLink } from 'react-router';
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
  avatarClasses,
} from '@mui/material';
import { Deal } from 'data/crm/deals';
import dayjs from 'dayjs';
import useNumberFormat from 'hooks/useNumberFormat';
import { useDealsContext } from 'providers/DealsProvider';
import { TOGGLE_DEAL_EXPAND } from 'reducers/DealsReducer';
import paths from 'routes/paths';
import { dashboardSpacing } from 'theme/spacing';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

interface DealCardProps {
  deal: Deal;
}

interface ContactLink {
  id: number;
  icon: string;
  href: string;
}

const contactLinks: ContactLink[] = [
  {
    id: 1,
    icon: 'material-symbols:call-outline',
    href: '#!',
  },
  {
    id: 2,
    icon: 'material-symbols:mail-outline-rounded',
    href: '#!',
  },
  {
    id: 3,
    icon: 'material-symbols:video-call-outline-rounded',
    href: '#!',
  },
  {
    id: 4,
    icon: 'material-symbols:contact-mail-outline-rounded',
    href: '#!',
  },
];

const DealCard = memo(({ deal }: DealCardProps) => {
  const { dealsDispatch } = useDealsContext();
  const { currencyFormat } = useNumberFormat();

  const handleExpandClick = () => {
    dealsDispatch({ type: TOGGLE_DEAL_EXPAND, payload: { id: deal.id as string } });
  };

  return (
    <Card sx={{ borderRadius: 2, bgcolor: 'background.paper', outline: 'none', border: 1, borderColor: 'divider' }}>
      <CardHeader
        avatar={deal.company ? <Image src={deal.company.logo} sx={{ height: 40, width: 40, borderRadius: 1.5 }} /> : undefined}
        title={
          <Typography
            variant="subtitle2"
            component={NavLink}
            to={paths.dealDetails(deal.id as string)}
            sx={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: 190, sm: 280 },
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {deal.name || deal.title}
          </Typography>
        }
        subheader={
          deal.company ? (
            <Typography variant="caption" component={Link} href={deal.company.link} color="text.secondary">
              {deal.company.name}
            </Typography>
          ) : null
        }
        action={
          <IconButton onClick={handleExpandClick} aria-label={deal.expanded ? 'Collapse deal details' : 'Expand deal details'}>
            <IconifyIcon
              icon="material-symbols:stat-minus-1-rounded"
              sx={(theme) => ({
                color: 'text.primary',
                transform: deal.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: theme.transitions.create('transform', {
                  duration: theme.transitions.duration.shortest,
                }),
              })}
            />
          </IconButton>
        }
        sx={{ p: dashboardSpacing.cardPadding }}
      />
      {!deal.expanded && (
        <CardContent sx={{ p: dashboardSpacing.cardPadding, pt: 0 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Budget:{' '}
            <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {currencyFormat(deal.amount, { minimumFractionDigits: 0 })}
            </Typography>
          </Typography>

          <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup
              max={3}
              sx={{
                [`& .${avatarClasses.root}`]: {
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  fontWeight: 'medium',
                  border: 'none',
                },
              }}
            >
              {deal.collaborators?.map((user: any) => (
                <Tooltip key={user.id} title={user.name}>
                  <Avatar alt={user.name} src={user.avatar} />
                </Tooltip>
              ))}
            </AvatarGroup>

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconifyIcon icon="material-symbols:schedule-outline" sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {dayjs(deal.closeDate).format('DD.MM.YY')}
              </Typography>
            </Stack>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={deal.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'background.elevation2',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: 'primary.main',
              },
            }}
          />
        </CardContent>
      )}
      <Collapse in={deal.expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ p: dashboardSpacing.cardPadding, pt: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Budget:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currencyFormat(deal.amount, { minimumFractionDigits: 0 })}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Last update:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {dayjs(deal.lastUpdate).format('DD MMM, YYYY')}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Stage:
            </Typography>
            <Stack>
              <Chip label={deal.stage} color="warning" />
            </Stack>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Contact:
            </Typography>
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography
                component={Link}
                variant="body2"
                sx={{ alignItems: 'center', fontWeight: 600, mr: 1.5 }}
              >
                {deal.client.name}
              </Typography>

              {contactLinks.map((item) => (
                <Button
                  key={item.id}
                  variant="soft"
                  shape="square"
                  color="neutral"
                  size="small"
                  sx={{ fontSize: 18 }}
                >
                  <IconifyIcon icon={item.icon} />
                </Button>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Agents:
            </Typography>

            {deal.collaborators?.map((user) => (
              <Chip
                key={user.id}
                avatar={
                  <Avatar
                    alt={user.name}
                    src={user.avatar}
                    sx={{ border: (theme) => `1px solid ${theme.vars.palette.background.default}` }}
                  />
                }
                label={user.name.replace(/(\w)\w+$/, '$1.')}
                color="neutral"
                sx={{ mr: 0.75 }}
              />
            ))}

            <Button
              variant="text"
              shape="square"
              color="primary"
              size="small"
              sx={{ fontSize: 18 }}
            >
              <IconifyIcon icon="material-symbols:person-add-outline" />
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Closing:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {dayjs(deal.closeDate).format('DD MMM, YYYY')}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            color={deal.progress === 100 ? 'success' : 'primary'}
            value={deal.progress}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
});

export default DealCard;
