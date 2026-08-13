import { ActivityEvent } from '../types/event';
import { Loan, LoanStatus } from '../types/loan';
import { BorrowerReputation, LenderReputation } from '../types/reputation';
import {
  BorrowingMetrics,
  LendingMetrics,
  LoanStatusDistribution,
  PerformanceMetrics,
  PortfolioAnalytics,
  TimeRangeOption,
  TimeSeriesDataPoint,
} from '../types/analytics';

export class AnalyticsService {
  calculateBorrowingMetrics(loans: Loan[], address: string | null): BorrowingMetrics {
    if (!address) {
      return {
        totalBorrowed: 0n,
        activeLoansCount: 0,
        completedLoansCount: 0,
        defaultedLoansCount: 0,
        outstandingAmount: 0n,
        totalRepaidAmount: 0n,
        averageLoanAmount: 0n,
      };
    }

    const borrowerLoans = loans.filter((l) => l.borrower.toLowerCase() === address.toLowerCase());
    const count = borrowerLoans.length;

    let totalBorrowed = 0n;
    let outstandingAmount = 0n;
    let totalRepaidAmount = 0n;
    let activeLoansCount = 0;
    let completedLoansCount = 0;
    let defaultedLoansCount = 0;

    for (const loan of borrowerLoans) {
      totalBorrowed += loan.principal;
      totalRepaidAmount += loan.amountRepaid;

      if (loan.status === LoanStatus.Active || loan.status === LoanStatus.Funded) {
        activeLoansCount++;
        outstandingAmount += loan.totalRepaymentAmount - loan.amountRepaid;
      } else if (loan.status === LoanStatus.Repaid) {
        completedLoansCount++;
      } else if (loan.status === LoanStatus.Defaulted) {
        defaultedLoansCount++;
        outstandingAmount += loan.totalRepaymentAmount - loan.amountRepaid;
      }
    }

    const averageLoanAmount = count > 0 ? totalBorrowed / BigInt(count) : 0n;

    return {
      totalBorrowed,
      activeLoansCount,
      completedLoansCount,
      defaultedLoansCount,
      outstandingAmount,
      totalRepaidAmount,
      averageLoanAmount,
    };
  }

  calculateLendingMetrics(loans: Loan[], address: string | null): LendingMetrics {
    if (!address) {
      return {
        totalLent: 0n,
        activeInvestmentsCount: 0,
        completedInvestmentsCount: 0,
        expectedRepayment: 0n,
        receivedRepayments: 0n,
        averageInvestment: 0n,
      };
    }

    const lenderLoans = loans.filter(
      (l) => l.lender && l.lender.toLowerCase() === address.toLowerCase()
    );
    const count = lenderLoans.length;

    let totalLent = 0n;
    let expectedRepayment = 0n;
    let receivedRepayments = 0n;
    let activeInvestmentsCount = 0;
    let completedInvestmentsCount = 0;

    for (const loan of lenderLoans) {
      totalLent += loan.principal;
      receivedRepayments += loan.amountRepaid;
      expectedRepayment += loan.totalRepaymentAmount;

      if (loan.status === LoanStatus.Active || loan.status === LoanStatus.Funded) {
        activeInvestmentsCount++;
      } else if (loan.status === LoanStatus.Repaid) {
        completedInvestmentsCount++;
      }
    }

    const averageInvestment = count > 0 ? totalLent / BigInt(count) : 0n;

    return {
      totalLent,
      activeInvestmentsCount,
      completedInvestmentsCount,
      expectedRepayment,
      receivedRepayments,
      averageInvestment,
    };
  }

  calculatePerformanceMetrics(
    borrowerRep: BorrowerReputation | null,
    borrowing: BorrowingMetrics
  ): PerformanceMetrics {
    const creditScore = borrowerRep ? borrowerRep.creditScore : 600;
    const totalLoans = borrowing.activeLoansCount + borrowing.completedLoansCount + borrowing.defaultedLoansCount;

    if (totalLoans === 0) {
      return {
        repaymentRate: 100,
        completionRate: 100,
        defaultRate: 0,
        creditScore,
      };
    }

    const completionRate = Math.round((borrowing.completedLoansCount / totalLoans) * 100);
    const defaultRate = Math.round((borrowing.defaultedLoansCount / totalLoans) * 100);
    const repaymentRate = Math.max(0, 100 - defaultRate);

    return {
      repaymentRate,
      completionRate,
      defaultRate,
      creditScore,
    };
  }

  calculateStatusDistribution(loans: Loan[]): LoanStatusDistribution {
    const dist: LoanStatusDistribution = {
      created: 0,
      funded: 0,
      active: 0,
      repaid: 0,
      defaulted: 0,
      cancelled: 0,
    };

    for (const loan of loans) {
      switch (loan.status) {
        case LoanStatus.Created:
          dist.created++;
          break;
        case LoanStatus.Funded:
          dist.funded++;
          break;
        case LoanStatus.Active:
          dist.active++;
          break;
        case LoanStatus.Repaid:
          dist.repaid++;
          break;
        case LoanStatus.Defaulted:
          dist.defaulted++;
          break;
        case LoanStatus.Cancelled:
          dist.cancelled++;
          break;
      }
    }

    return dist;
  }

  generateTimeSeries(events: ActivityEvent[], timeRange: TimeRangeOption): TimeSeriesDataPoint[] {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const now = Date.now();
    const millisPerDay = 86400 * 1000;

    const dataMap = new Map<string, { borrowed: number; lent: number; repaid: number }>();

    for (let i = days - 1; i >= 0; i--) {
      const dateStr = new Date(now - i * millisPerDay).toISOString().split('T')[0];
      dataMap.set(dateStr, { borrowed: 0, lent: 0, repaid: 0 });
    }

    for (const evt of events) {
      const dateStr = new Date(evt.timestamp).toISOString().split('T')[0];
      if (dataMap.has(dateStr)) {
        const entry = dataMap.get(dateStr)!;
        const amountNum = evt.amount ? parseFloat(evt.amount) : 0;

        if (evt.type === 'loan_create') {
          entry.borrowed += amountNum;
        } else if (evt.type === 'loan_fund') {
          entry.lent += amountNum;
        } else if (evt.type === 'loan_repay') {
          entry.repaid += amountNum;
        }
      }
    }

    const result: TimeSeriesDataPoint[] = [];
    dataMap.forEach((val, date) => {
      result.push({
        date,
        borrowed: Math.round(val.borrowed * 100) / 100,
        lent: Math.round(val.lent * 100) / 100,
        repaid: Math.round(val.repaid * 100) / 100,
      });
    });

    return result;
  }
}

export const analyticsService = new AnalyticsService();
