/**
 * Clipboard Module Types
 */

export interface ClipboardStore {
  copyToClipboard: (text: string) => Promise<boolean>;
}

