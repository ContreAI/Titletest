/**
 * Simple store for pending file during smart upload flow.
 *
 * File objects can't be serialized in navigation state, so we store
 * the actual File object here temporarily during the create transaction flow.
 *
 * Flow:
 * 1. SmartUploadDialog stores file via setPendingFile() before navigating
 * 2. CreateTransactionPage retrieves file via getPendingFile() after creation
 * 3. File is cleared after retrieval to prevent stale data
 */

let pendingFile: File | null = null;

export const setPendingFile = (file: File | null): void => {
  pendingFile = file;
};

export const getPendingFile = (): File | null => {
  const file = pendingFile;
  // Clear after retrieval to prevent stale data
  pendingFile = null;
  return file;
};

export const hasPendingFile = (): boolean => {
  return pendingFile !== null;
};
