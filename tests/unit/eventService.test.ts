import { describe, it, expect } from 'vitest';
import { eventService } from '../../src/services/event-service';
import { ActivityEvent } from '../../src/types/event';

describe('EventService Filtering & Processing', () => {
  const mockEvents: ActivityEvent[] = [
    {
      id: 'evt-1',
      type: 'loan_create',
      contractId: 'CBLON1',
      transactionHash: 'hash-1',
      ledger: 100,
      timestamp: Date.now() - 10000,
      actor: 'GBORROWER1',
      loanId: '1',
      amount: '1000',
      details: 'Created loan #1',
      explorerUrl: 'https://stellar.expert/explorer/testnet/tx/hash-1',
    },
    {
      id: 'evt-2',
      type: 'loan_fund',
      contractId: 'CBLON1',
      transactionHash: 'hash-2',
      ledger: 101,
      timestamp: Date.now() - 5000,
      actor: 'GLENDER1',
      loanId: '1',
      amount: '1000',
      details: 'Funded loan #1',
      explorerUrl: 'https://stellar.expert/explorer/testnet/tx/hash-2',
    },
  ];

  it('should filter events by eventType correctly', () => {
    const filtered = eventService.filterEvents(mockEvents, { eventType: 'loan_create' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('evt-1');
  });

  it('should filter events by actor correctly', () => {
    const filtered = eventService.filterEvents(mockEvents, { actor: 'GLENDER1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('evt-2');
  });

  it('should filter events by loanId correctly', () => {
    const filtered = eventService.filterEvents(mockEvents, { loanId: '1' });
    expect(filtered).toHaveLength(2);
  });
});
