import {
  Dispatch,
  PropsWithChildren,
  createContext,
  use,
  useCallback,
  useReducer,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Deal, DealList } from 'data/crm/deals';
import {
  ACTIONTYPE,
  DRAG_END,
  DRAG_OVER,
  DRAG_START,
  SET_LIST_ITEMS,
  dealsReducer,
} from 'reducers/DealsReducer';
import { useTransactionsStore } from 'modules/transactions/store/transactions.store';
import { Transaction, TransactionStatus } from 'modules/transactions/typings/transactions.types';
import { useTransactionReportsStore } from 'modules/transaction-reports/store/transaction-reports.store';
import { TransactionReport } from 'modules/transaction-reports/typings/transaction-reports.types';
import { deriveStatusFromTimeline } from 'lib/deal-status';

// Status configuration for kanban columns
const KANBAN_COLUMNS: { id: TransactionStatus; title: string }[] = [
  { id: 'active', title: 'Active' },
  { id: 'post_em', title: 'Post Earnest Money' },
  { id: 'inspection_cleared', title: 'Inspection Cleared' },
  { id: 'ready_for_close', title: 'Ready for Close' },
  { id: 'completed', title: 'Completed' },
];

// Transform a Transaction to a Deal for the kanban board
const transactionToDeal = (transaction: Transaction): Deal => ({
  id: transaction.id,
  name: transaction.transactionName,
  title: transaction.transactionName,
  amount: 0, // Could map to list_price/offer_price if available
  stage: transaction.status,
  company: {
    id: 1,
    name: `${transaction.propertyAddress?.city || ''}, ${transaction.propertyAddress?.state || ''}`,
    logo: '',
    link: `/transactions/${transaction.id}`,
  },
  client: {
    name: transaction.transactionName,
    phone: '',
    email: '',
    videoChat: '',
    address: transaction.propertyAddress
      ? `${transaction.propertyAddress.streetAddress}, ${transaction.propertyAddress.city}`
      : '',
    link: `/transactions/${transaction.id}`,
  },
  collaborators: [],
  expanded: false,
  description: transaction.propertyAddress
    ? `${transaction.propertyAddress.streetAddress}, ${transaction.propertyAddress.city}`
    : '',
  lastUpdate: transaction.updatedAt,
  createDate: transaction.createdAt,
  closeDate: transaction.createdAt, // Placeholder - could use estimated_closing_date if available
  priority: transaction.status === 'ready_for_close' ? 'high' : 'medium',
  progress: getProgressFromStatus(transaction.status),
});

// Calculate progress percentage based on status
const getProgressFromStatus = (status: TransactionStatus): number => {
  const progressMap: Record<TransactionStatus, number> = {
    draft: 0,
    active: 20,
    pending: 30,
    post_em: 40,
    inspection_cleared: 60,
    ready_for_close: 80,
    completed: 100,
    closed: 100,
    cancelled: 0,
  };
  return progressMap[status] ?? 0;
};

// Transform transactions array into DealList[] grouped by status
// Uses report data to derive status from timeline dates when available
// Note: Timeline-derived status is the single source of truth for deal stage
const transformTransactionsToDeals = (
  transactions: Transaction[],
  transactionReports: Map<string, TransactionReport>,
): DealList[] => {
  return KANBAN_COLUMNS.map((column) => ({
    id: column.id,
    title: column.title,
    compactMode: false,
    deals: transactions
      .filter((t) => {
        const report = transactionReports.get(t.id);
        // Timeline dates in report.data are the source of truth for deal stage
        // Falls back to 'active' only when no timeline data exists
        const derivedStatus = deriveStatusFromTimeline(report?.data, 'active');
        return derivedStatus === column.id;
      })
      .map(transactionToDeal),
  }));
};

// Get status from column id
const getStatusFromColumnId = (columnId: string): TransactionStatus | null => {
  const column = KANBAN_COLUMNS.find((c) => c.id === columnId);
  return column ? column.id : null;
};

export interface DealsState {
  listItems: DealList[];
  draggedList: DealList | null;
  draggedDeal: Deal | null;
  createDealDialog: { isOpen: boolean; listId?: string };
}

const initialState: DealsState = {
  listItems: KANBAN_COLUMNS.map((c) => ({ id: c.id, title: c.title, compactMode: false, deals: [] })),
  createDealDialog: { isOpen: false },
  draggedList: null,
  draggedDeal: null,
};

interface DealsContextInterface extends DealsState {
  dealsDispatch: Dispatch<ACTIONTYPE>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const DealsContext = createContext({} as DealsContextInterface);

const DealsProvider = ({ children }: PropsWithChildren) => {
  const [state, dealsDispatch] = useReducer(dealsReducer, initialState);

  // Connect to transactions store
  const { transactions, isLoading, fetchTransactions, updateTransactionStatus } =
    useTransactionsStore();

  // Connect to transaction reports store for timeline data
  const { transactionReports, fetchTransactionReport } = useTransactionReportsStore();

  // Fetch transactions on mount - subsequent updates come via WebSocket
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fetch reports for transactions that don't have reports cached
  // This handles initial load; WebSocket events handle real-time updates
  // The store has de-duplication logic via pendingRequests Map
  useEffect(() => {
    transactions.forEach((transaction) => {
      // Only fetch if not already in the store
      if (!transactionReports.has(transaction.id)) {
        fetchTransactionReport(transaction.id).catch((error) => {
          // Only log if it's not a 404 (report doesn't exist yet)
          if (error?.response?.status !== 404 && error?.status !== 404) {
            console.error(`[DealsProvider] Failed to fetch report for transaction ${transaction.id}:`, error);
          }
        });
      }
    });
  }, [transactions, transactionReports, fetchTransactionReport]);

  // Transform and sync transactions to deals when transactions or reports change
  // This is reactive - WebSocket events update the stores, which triggers this useMemo
  useEffect(() => {
    if (transactions.length > 0) {
      const dealLists = transformTransactionsToDeals(transactions, transactionReports);
      dealsDispatch({ type: SET_LIST_ITEMS, payload: { listItems: dealLists } });
    }
  }, [transactions, transactionReports]);

  const handleDragStart = (event: DragStartEvent) => {
    dealsDispatch({
      type: DRAG_START,
      payload: { type: event.active.data.current?.type, item: event.active.data.current },
    });
  };

  const dragOverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    clearTimeout(dragOverTimeoutRef.current);
    dragOverTimeoutRef.current = setTimeout(() => {
      dealsDispatch({
        type: DRAG_OVER,
        payload: {
          activeId: event.active.id as string,
          overId: event.over?.id as string,
          activeRect: event.active.rect.current.translated,
          overRect: event.over?.rect,
        },
      });
    }, 16);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const activeId = event.active.id as string;
      const overId = event.over?.id as string;

      // Find which column the deal was dropped into
      const targetColumn = state.listItems.find(
        (list) => list.id === overId || list.deals.some((d) => d.id === overId),
      );

      // If deal was moved to a different column, update status
      if (targetColumn && event.active.data.current?.type === 'deal') {
        const dealId = activeId;
        const newStatus = getStatusFromColumnId(targetColumn.id as string);

        if (newStatus) {
          // Find current status of the deal
          const currentColumn = state.listItems.find((list) =>
            list.deals.some((d) => d.id === dealId),
          );

          if (currentColumn && currentColumn.id !== targetColumn.id) {
            // Status changed - update via API
            updateTransactionStatus(dealId, newStatus).catch((error) => {
              console.error('Failed to update transaction status:', error);
              // Reducer handles optimistic update rollback in store
            });
          }
        }
      }

      dealsDispatch({
        type: DRAG_END,
        payload: { activeId, overId },
      });
    },
    [state.listItems, updateTransactionStatus],
  );

  const contextValue = useMemo(
    () => ({
      ...state,
      dealsDispatch,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      isLoading,
      refetch: fetchTransactions,
    }),
    [state, handleDragOver, handleDragEnd, isLoading, fetchTransactions],
  );

  return <DealsContext value={contextValue}>{children}</DealsContext>;
};

export const useDealsContext = () => use(DealsContext);

export default DealsProvider;
