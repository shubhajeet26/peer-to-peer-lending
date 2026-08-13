import { useQuery } from '@tanstack/react-query';
import { reputationRegistryService } from '../contracts/reputation-registry';

export function useBorrowerReputation(address: string | null) {
  return useQuery({
    queryKey: ['borrower-reputation', address],
    queryFn: async () => {
      if (!address) return null;
      return reputationRegistryService.getBorrowerReputation(address);
    },
    enabled: Boolean(address),
    staleTime: 30_000,
  });
}

export function useLenderReputation(address: string | null) {
  return useQuery({
    queryKey: ['lender-reputation', address],
    queryFn: async () => {
      if (!address) return null;
      return reputationRegistryService.getLenderReputation(address);
    },
    enabled: Boolean(address),
    staleTime: 30_000,
  });
}
