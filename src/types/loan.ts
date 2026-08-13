export enum LoanStatus {
  Created = 0,
  Funded = 1,
  Active = 2,
  Repaid = 3,
  Defaulted = 4,
  Cancelled = 5,
}

export interface RepaymentSchedule {
  totalInstallments: number;
  installmentsPaid: number;
  intervalSeconds: number;
  installmentAmount: bigint;
  nextDueTimestamp: number;
}

export interface Loan {
  id: bigint;
  borrower: string;
  lender: string | null;
  token: string;
  principal: bigint;
  interestRateBps: number;
  durationSeconds: number;
  createdAt: number;
  fundedAt: number;
  maturityTimestamp: number;
  amountFunded: bigint;
  totalRepaymentAmount: bigint;
  amountRepaid: bigint;
  status: LoanStatus;
  schedule: RepaymentSchedule;
  purposeHash: string;
}

export interface CreateLoanParams {
  borrower: string;
  token: string;
  principal: bigint;
  interestRateBps: number;
  durationSeconds: number;
  totalInstallments: number;
  purposeHash: string;
}
