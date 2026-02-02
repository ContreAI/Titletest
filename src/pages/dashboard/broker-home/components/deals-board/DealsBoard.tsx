import { useCallback, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DealsKanbanProvider, { useDealsContext } from 'providers/DealsProvider';
import SimpleBar from 'components/base/SimpleBar';
import DealsKanban from '../deals/DealsKanban';
import CreateDealDialog from '../deals/deal-card/CreateDealDialog';
import MobileScrollIndicator from '../deals/MobileScrollIndicator';

const index = () => {
  return (
    <DealsKanbanProvider>
      <DealsBoard />
    </DealsKanbanProvider>
  );
};

const DealsBoard = () => {
  const { down } = useBreakpoints();
  const isMobile = down('md');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const { listItems, isLoading } = useDealsContext();

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !isMobile) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const columnWidth = container.scrollWidth / listItems.length;
    const newIndex = Math.round(scrollLeft / columnWidth);
    setActiveColumnIndex(Math.min(newIndex, listItems.length - 1));
  }, [isMobile, listItems.length]);

  const handleIndicatorClick = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const columnWidth = container.scrollWidth / listItems.length;
    container.scrollTo({
      left: columnWidth * index,
      behavior: 'smooth',
    });
  }, [listItems.length]);

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          height: { xs: 500, sm: 550, md: 600 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading transactions...
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Paper
        sx={{
          height: { xs: 500, sm: 550, md: 600 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        {isMobile ? (
          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              height: 1,
              overflowX: 'auto',
              overflowY: 'hidden',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              '&::-webkit-scrollbar': {
                height: 4,
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'action.hover',
                borderRadius: 2,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'primary.main',
                borderRadius: 2,
              },
            }}
          >
            <Stack
              direction="row"
              sx={{
                height: 1,
                gap: 2,
                px: 2,
                py: 1,
              }}
            >
              <DealsKanban />
            </Stack>
          </Box>
        ) : (
          <SimpleBar>
            <Stack sx={{ height: 1 }}>
              <DealsKanban />
            </Stack>
          </SimpleBar>
        )}
      </Paper>
      {isMobile && listItems.length > 0 && (
        <MobileScrollIndicator
          totalColumns={listItems.length}
          activeIndex={activeColumnIndex}
          onIndicatorClick={handleIndicatorClick}
        />
      )}
      <CreateDealDialog />
    </Paper>
  );
};

export default index;
