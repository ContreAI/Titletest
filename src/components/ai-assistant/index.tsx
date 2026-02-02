/**
 * AI Assistant Component
 *
 * Main component that combines floating button and chat window
 * Available on transaction detail pages, transactions list page, and dashboard
 */

import { useLocation } from 'react-router';
import ChatFloatingButton from './ChatFloatingButton';
import ChatWindow from './ChatWindow';

const AIAssistant = () => {
  const location = useLocation();

  // Show AI Assistant on transaction detail pages (UUID format), transactions list, and dashboard
  const isTransactionDetailPage = /^\/transactions\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(location.pathname);
  const isTransactionsListPage = location.pathname === '/transactions';
  const isDashboardPage = location.pathname === '/dashboard';

  if (!isTransactionDetailPage && !isTransactionsListPage && !isDashboardPage) {
    return null;
  }

  return (
    <>
      <ChatFloatingButton />
      <ChatWindow />
    </>
  );
};

export default AIAssistant;

