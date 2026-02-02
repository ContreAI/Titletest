import EmptyState from 'components/base/EmptyState';
import { EmptyTransactionsIllustration } from 'components/base/EmptyStateIllustrations';

interface DealsEmptyStateProps {
  onCreateClick?: () => void;
}

/**
 * DealsEmptyState - Empty state when no deals/transactions exist
 * Uses standardized EmptyState component with Pacific NW themed illustration
 */
const DealsEmptyState = ({ onCreateClick }: DealsEmptyStateProps) => {
  return (
    <EmptyState
      icon={<EmptyTransactionsIllustration />}
      title="No transactions yet"
      description="Create your first transaction to start tracking deals and managing your pipeline."
      action={
        onCreateClick
          ? {
              label: 'New Transaction',
              onClick: onCreateClick,
            }
          : undefined
      }
    />
  );
};

export default DealsEmptyState;

