export type ActivityEventType =
  | 'loan_create'
  | 'loan_cancel'
  | 'loan_fund'
  | 'loan_disburse'
  | 'loan_repay'
  | 'loan_complete'
  | 'loan_default'
  | 'reputation_update'
  | 'unknown';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  contractId: string;
  transactionHash: string;
  ledger: number;
  timestamp: number;
  actor: string;
  loanId?: string;
  amount?: string;
  asset?: string;
  details: string;
  explorerUrl: string;
}

export interface ActivityFilterOptions {
  eventType?: ActivityEventType;
  actor?: string;
  loanId?: string;
  contractId?: string;
}
