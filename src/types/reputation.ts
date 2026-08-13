export interface BorrowerReputation {
  address: string;
  totalLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalBorrowed: bigint;
  totalRepaid: bigint;
  onTimeRepayments: number;
  lateRepayments: number;
  creditScore: number;
  lastUpdated: number;
}

export interface LenderReputation {
  address: string;
  totalFundedLoans: number;
  totalAmountFunded: bigint;
  totalYieldEarned: bigint;
  lastUpdated: number;
}
