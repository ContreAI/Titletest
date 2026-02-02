export interface TransactionDocument {
  name: string;
  filename: string;
  date: string;
}

export interface DealInfoItem {
  label: string;
  value: string;
  isChip?: boolean;
}

import type { DealStage } from 'types/deals';

export interface RiskAlert {
  level: 'high' | 'medium' | 'low';
  count: number;
}

export const transactionDocuments: TransactionDocument[] = [
  { name: 'Purchase & Sale Agreement', filename: '<filename>', date: '21 Jan, 2025' },
  { name: 'HOA Document', filename: '<filename>', date: '23 Jan, 2025' },
  { name: 'Title Report', filename: '<filename>', date: '23 Jan, 2025' },
  { name: 'Inspection Report', filename: '<filename>', date: '30 Jan, 2025' },
];

export const dealInformationItems: DealInfoItem[] = [
  { label: 'Current Stage:', value: 'Post EM', isChip: true },
  { label: 'Effective Contract Date:', value: '10/1/2025' },
  { label: 'Earnest Money Due:', value: '10/7/2025' },
  { label: 'Inspection Deadline:', value: '10/29/2025' },
  { label: 'Financing Deadline:', value: '10/31/25' },
  { label: 'Closing Date:', value: '11/7/2025' },
  { label: 'Client Name:', value: 'Teamina Mina' },
  { label: 'Other Party', value: 'Schiltz Family Trust' },
  { label: 'Purchase Price:', value: '$645,000' },
  { label: 'Title Company:', value: 'North Boston Title' },
  { label: 'Title Commitment:', value: 'October 19, 2025' },
  { label: 'Seller Disclosure:', value: 'October 16, 2025' },
];

export const transactionStages: DealStage[] = [
  { name: 'Active', completed: true },
  { name: 'Post EM', completed: true },
  { name: 'Inspection Cleared', completed: false },
  { name: 'Ready for Close', completed: false },
];

export const riskAlerts: RiskAlert[] = [
  { level: 'high', count: 1 },
  { level: 'medium', count: 1 },
  { level: 'low', count: 1 },
];

