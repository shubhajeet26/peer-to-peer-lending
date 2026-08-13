import { describe, it, expect } from 'vitest';
import { analyticsService } from '../../src/services/analytics-service';
import { Loan, LoanStatus } from '../../src/types/loan';

describe('AnalyticsService Calculations', () => {
  const mockLoans: Loan[] = [
    {
      id: 1n,
      borrower: 'GBORROWER1',
      lender: 'GLENDER1',
      token: 'CBTOKEN',
      principal: 1_000_0000000n, // 1000 XLM
      interestRateBps: 1000,
      durationSeconds: 2592000,
      createdAt: 1000,
      fundedAt: 2000,
      maturityTimestamp: 3000,
      amountFunded: 1_000_0000000n,
      totalRepaymentAmount: 1_100_0000000n,
      amountRepaid: 1_100_0000000n,
      status: LoanStatus.Repaid,
      schedule: {
        totalInstallments: 1,
        installmentsPaid: 1,
        intervalSeconds: 2592000,
        installmentAmount: 1_100_0000000n,
        nextDueTimestamp: 3000,
      },
      purposeHash: '',
    },
    {
      id: 2n,
      borrower: 'GBORROWER1',
      lender: 'GLENDER2',
      token: 'CBTOKEN',
      principal: 2_000_0000000n, // 2000 XLM
      interestRateBps: 1000,
      durationSeconds: 2592000,
      createdAt: 1000,
      fundedAt: 2000,
      maturityTimestamp: 3000,
      amountFunded: 2_000_0000000n,
      totalRepaymentAmount: 2_200_0000000n,
      amountRepaid: 0n,
      status: LoanStatus.Active,
      schedule: {
        totalInstallments: 1,
        installmentsPaid: 0,
        intervalSeconds: 2592000,
        installmentAmount: 2_200_0000000n,
        nextDueTimestamp: 3000,
      },
      purposeHash: '',
    },
  ];

  it('should calculate borrowing metrics correctly for an address', () => {
    const borrowing = analyticsService.calculateBorrowingMetrics(mockLoans, 'GBORROWER1');
    expect(borrowing.totalBorrowed).toBe(3_000_0000000n);
    expect(borrowing.completedLoansCount).toBe(1);
    expect(borrowing.activeLoansCount).toBe(1);
    expect(borrowing.outstandingAmount).toBe(2_200_0000000n);
    expect(borrowing.averageLoanAmount).toBe(1_500_0000000n);
  });

  it('should calculate lending metrics correctly for an address', () => {
    const lending = analyticsService.calculateLendingMetrics(mockLoans, 'GLENDER1');
    expect(lending.totalLent).toBe(1_000_0000000n);
    expect(lending.completedInvestmentsCount).toBe(1);
    expect(lending.receivedRepayments).toBe(1_100_0000000n);
  });

  it('should calculate loan status distribution accurately', () => {
    const dist = analyticsService.calculateStatusDistribution(mockLoans);
    expect(dist.repaid).toBe(1);
    expect(dist.active).toBe(1);
    expect(dist.created).toBe(0);
  });
});
