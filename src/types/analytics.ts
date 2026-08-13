export type TimeRangeOption = '7d' | '30d' | '90d' | '1y' | 'all';

export interface BorrowingMetrics {
  totalBorrowed: bigint;
  activeLoansCount: number;
  completedLoansCount: number;
  defaultedLoansCount: number;
  outstandingAmount: bigint;
  totalRepaidAmount: bigint;
  averageLoanAmount: bigint;
}

export interface LendingMetrics {
  totalLent: bigint;
  activeInvestmentsCount: number;
  completedInvestmentsCount: number;
  expectedRepayment: bigint;
  receivedRepayments: bigint;
  averageInvestment: bigint;
}

export interface PerformanceMetrics {
  repaymentRate: number; // 0 to 100%
  completionRate: number; // 0 to 100%
  defaultRate: number; // 0 to 100%
  creditScore: number; // 300 to 1000
}

export interface LoanStatusDistribution {
  created: number;
  funded: number;
  active: number;
  repaid: number;
  defaulted: number;
  cancelled: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  borrowed: number;
  lent: number;
  repaid: number;
}

export interface PortfolioAnalytics {
  borrowing: BorrowingMetrics;
  lending: LendingMetrics;
  performance: PerformanceMetrics;
  statusDistribution: LoanStatusDistribution;
  timeSeries: TimeSeriesDataPoint[];
}
