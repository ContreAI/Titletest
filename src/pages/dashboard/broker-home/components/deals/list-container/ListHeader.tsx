import Badge, { badgeClasses } from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useNumberFormat from 'hooks/useNumberFormat';
import { useDealsContext } from 'providers/DealsProvider';
import { TOGGLE_COMPACT_MODE } from 'reducers/DealsReducer';
import IconifyIcon from 'components/base/IconifyIcon';
// ListMenu removed - kanban columns are fixed statuses and should not be editable

interface ListHeaderProps {
  listId: string;
  title: string;
  totalBudget: number;
  compactMode: boolean;
  dealCount: number;
}

const ListHeader = ({ listId, title, totalBudget, compactMode, dealCount }: ListHeaderProps) => {
  const { dealsDispatch } = useDealsContext();
  const { currencyFormat } = useNumberFormat();

  return (
    <Stack
      sx={[
        {
          px: 2,
          py: 0.75,
          gap: 0.5,
          alignItems: 'center',
          bgcolor: 'background.elevation0',
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
        },
        compactMode && { px: 0, borderBottom: 'none' },
      ]}
    >
      {!compactMode && (
        <>
          <Badge
            badgeContent={`${dealCount}`}
            sx={{
              mr: 2,
              [`& .${badgeClasses.badge}`]: {
                right: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'success.main',
                color: 'white',
                fontWeight: 600,
                minWidth: 16,
                height: 16,
                fontSize: '0.75rem',
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textWrap: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: '13px',
                cursor: 'pointer',
                mr: '8px',
              }}
            >
              {title}
            </Typography>
          
          </Badge>

          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem', pl: '4px' }}>
            {currencyFormat(totalBudget, { minimumFractionDigits: 0 })}
          </Typography>
        </>
      )}

      <Button
        variant="text"
        color="neutral"
        size="small"
        shape="square"
        onClick={() => dealsDispatch({ type: TOGGLE_COMPACT_MODE, payload: { id: listId } })}
        onPointerDown={(e) => e.stopPropagation()}
        sx={[compactMode && { mx: 'auto' }]}
      >
        <IconifyIcon
          icon={
            compactMode
              ? 'material-symbols:open-in-full-rounded'
              : 'material-symbols:close-fullscreen-rounded'
          }
          sx={{ fontSize: 18, pointerEvents: 'none' }}
        />
      </Button>
    </Stack>
  );
};

export default ListHeader;
