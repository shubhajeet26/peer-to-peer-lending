import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityItem } from '../../src/components/activity/ActivityItem';
import { ActivityEvent } from '../../src/types/event';

describe('ActivityFeed Components', () => {
  const mockEvent: ActivityEvent = {
    id: 'evt-100',
    type: 'loan_fund',
    contractId: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
    transactionHash: 'hash-abc-123',
    ledger: 54321,
    timestamp: Date.now() - 60000,
    actor: 'GLENDER1234567890123456789012345678901234567890123456',
    loanId: '42',
    amount: '500.00',
    details: 'Funded loan #42 with 500.00 XLM principal',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/hash-abc-123',
  };

  it('should render ActivityItem details, badges, and actor address', () => {
    render(<ActivityItem event={mockEvent} />);

    expect(screen.getByText(/Loan Funded/i)).toBeInTheDocument();
    expect(screen.getByText(/Funded loan #42 with 500.00 XLM principal/i)).toBeInTheDocument();
    expect(screen.getByText(/#54321/i)).toBeInTheDocument();
    expect(screen.getByText(/Tx Explorer ↗/i)).toBeInTheDocument();
  });
});
