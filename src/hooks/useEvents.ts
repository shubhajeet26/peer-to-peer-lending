import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { eventService } from '../services/event-service';
import { ActivityEvent, ActivityFilterOptions } from '../types/event';

export function useActivityFeed(filters?: ActivityFilterOptions) {
  const queryClient = useQueryClient();

  const query = useQuery<ActivityEvent[]>({
    queryKey: ['activity-feed', filters],
    queryFn: async () => {
      const allEvents = await eventService.fetchContractEvents();
      if (!filters) return allEvents;
      return eventService.filterEvents(allEvents, filters);
    },
    refetchInterval: 6_000, // Poll RPC for new events every 6s
    staleTime: 5_000,
  });

  const invalidateQueriesOnEvent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['loan-count'] });
    queryClient.invalidateQueries({ queryKey: ['marketplace-loans'] });
    queryClient.invalidateQueries({ queryKey: ['borrower-reputation'] });
    queryClient.invalidateQueries({ queryKey: ['lender-reputation'] });
  }, [queryClient]);

  return {
    ...query,
    invalidateQueriesOnEvent,
  };
}

export function useUserActivity(address: string | null) {
  return useActivityFeed(address ? { actor: address } : undefined);
}

export function useLoanActivity(loanId: string | null) {
  return useActivityFeed(loanId ? { loanId } : undefined);
}
