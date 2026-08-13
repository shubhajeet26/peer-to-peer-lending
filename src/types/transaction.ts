export type TransactionStatus =
  | 'idle'
  | 'preparing'
  | 'simulating'
  | 'awaiting_signature'
  | 'submitting'
  | 'processing'
  | 'confirmed'
  | 'failed';

export interface TransactionRecord {
  id: string;
  hash?: string;
  type: 'create_loan' | 'fund_loan' | 'repay_loan' | 'cancel_loan' | 'check_default' | 'generic';
  status: TransactionStatus;
  createdAt: number;
  updatedAt: number;
  account: string;
  loanId?: string;
  amount?: string;
  token?: string;
  error?: string;
  explorerUrl?: string;
  rawXdr?: string;
}

export interface TransactionResult {
  status: TransactionStatus;
  hash?: string;
  error?: string;
  explorerUrl?: string;
  timestamp: number;
}

export interface TransactionStoreState {
  transactions: TransactionRecord[];
  activeTxId: string | null;

  // Actions
  addTransaction: (tx: Omit<TransactionRecord, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTransactionStatus: (id: string, status: TransactionStatus, hash?: string, error?: string) => void;
  setActiveTxId: (id: string | null) => void;
  clearTransactions: () => void;
}
