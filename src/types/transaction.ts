export type TransactionStatus =
  | 'idle'
  | 'preparing'
  | 'simulating'
  | 'awaiting_signature'
  | 'submitting'
  | 'confirmed'
  | 'failed';

export interface TransactionResult {
  status: TransactionStatus;
  hash?: string;
  error?: string;
  explorerUrl?: string;
  timestamp: number;
}
