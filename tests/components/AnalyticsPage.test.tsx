import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricCard } from '../../src/components/analytics/MetricCard';
import { ReputationCard } from '../../src/components/analytics/ReputationCard';
import { BorrowerReputation } from '../../src/types/reputation';

describe('Analytics UI Components', () => {
  const mockReputation: BorrowerReputation = {
    address: 'GBORROWER123',
    totalLoans: 5,
    completedLoans: 4,
    defaultedLoans: 0,
    totalBorrowed: 5000_0000000n,
    totalRepaid: 5000_0000000n,
    onTimeRepayments: 4,
    lateRepayments: 0,
    creditScore: 720,
    lastUpdated: Date.now(),
  };

  it('should render MetricCard with title, value, and badge', () => {
    render(
      <MetricCard
        title="Total Borrowed"
        value="5000.00 XLM"
        subtitle="4 Active Loans"
        icon="💳"
        badgeText="Borrower"
      />
    );

    expect(screen.getByText(/TOTAL BORROWED/i)).toBeInTheDocument();
    expect(screen.getByText(/5000.00 XLM/i)).toBeInTheDocument();
    expect(screen.getByText(/Borrower/i)).toBeInTheDocument();
  });

  it('should render ReputationCard credit score and tier badge', () => {
    render(<ReputationCard reputation={mockReputation} />);

    expect(screen.getByText(/On-Chain Credit Score/i)).toBeInTheDocument();
    expect(screen.getByText(/720/i)).toBeInTheDocument();
    expect(screen.getByText(/GOOD/i)).toBeInTheDocument();
  });
});
