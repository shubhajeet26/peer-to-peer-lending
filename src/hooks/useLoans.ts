import { useQuery } from '@tanstack/react-query';
import { loanManagerService } from '../contracts/loan_manager';
import { Loan } from '../types/loan';

export function useLoanCount() {
  return useQuery({
    queryKey: ['loan-count'],
    queryFn: () => loanManagerService.getLoanCount(),
    staleTime: 10_000,
  });
}

export function useLoanDetails(loanId: bigint | null) {
  return useQuery({
    queryKey: ['loan-details', loanId?.toString()],
    queryFn: async () => {
      if (loanId === null || loanId === undefined) return null;
      return loanManagerService.getLoan(loanId);
    },
    enabled: loanId !== null && loanId !== undefined,
    staleTime: 15_000,
  });
}

export function useMarketplaceLoans() {
  const { data: totalLoans = 0n } = useLoanCount();

  return useQuery({
    queryKey: ['marketplace-loans', totalLoans.toString()],
    queryFn: async () => {
      const count = Number(totalLoans);
      if (count === 0) return [];

      const promises: Promise<Loan | null>[] = [];
      for (let i = 1; i <= count; i++) {
        promises.push(loanManagerService.getLoan(BigInt(i)));
      }

      const results = await Promise.all(promises);
      return results.filter((l): l is Loan => l !== null);
    },
    staleTime: 10_000,
  });
}
