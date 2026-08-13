import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics-service';
import { useActivityFeed } from './useEvents';
import { useMarketplaceLoans } from './useLoans';
import { useBorrowerReputation } from './useReputation';
import { useWallet } from './useWallet';
import { PortfolioAnalytics, TimeRangeOption } from '../types/analytics';

export function usePortfolioAnalytics(timeRange: TimeRangeOption = '30d') {
  const { walletAddress } = useWallet();
  const { data: marketplaceLoans = [], isLoading: isLoansLoading } = useMarketplaceLoans();
  const { data: borrowerRep, isLoading: isBorrowerRepLoading } = useBorrowerReputation(walletAddress);
  const { data: activityEvents = [], isLoading: isEventsLoading } = useActivityFeed();

  const isLoading = isLoansLoading || isBorrowerRepLoading || isEventsLoading;

  return useQuery<PortfolioAnalytics>({
    queryKey: ['portfolio-analytics', walletAddress, timeRange, marketplaceLoans.length, activityEvents.length],
    queryFn: () => {
      const borrowing = analyticsService.calculateBorrowingMetrics(marketplaceLoans, walletAddress);
      const lending = analyticsService.calculateLendingMetrics(marketplaceLoans, walletAddress);
      const performance = analyticsService.calculatePerformanceMetrics(borrowerRep || null, borrowing);
      const statusDistribution = analyticsService.calculateStatusDistribution(marketplaceLoans);
      const timeSeries = analyticsService.generateTimeSeries(activityEvents, timeRange);

      return {
        borrowing,
        lending,
        performance,
        statusDistribution,
        timeSeries,
      };
    },
    enabled: !isLoading,
    staleTime: 10_000,
  });
}
