import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chat.store';
import { ChatPageContext } from '../typings/chat.types';

/**
 * Hook to register page context for the chat assistant.
 * Sets context on mount and when context values change.
 * Does NOT clear on unmount to avoid race conditions during navigation.
 *
 * @example
 * // In TransactionDetail page:
 * useChatPageContext({
 *   pageType: 'transaction-detail',
 *   transactionId: id,
 *   transactionAddress: fullAddress,
 * });
 */
export const useChatPageContext = (context: ChatPageContext) => {
  const setPageContext = useChatStore((state) => state.setPageContext);
  const prevContextRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Create a stable key to detect actual changes
    // Key includes all possible context fields (union type properties)
    const contextKey = JSON.stringify(context);

    // Only update if context actually changed
    if (prevContextRef.current !== contextKey) {
      prevContextRef.current = contextKey;
      setPageContext(context);
    }
  }, [context, setPageContext]);
};
