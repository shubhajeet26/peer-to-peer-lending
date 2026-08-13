import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionStatusCard } from '../../src/components/transaction/TransactionStatusCard';
import { TransactionDetailsModal } from '../../src/components/transaction/TransactionDetailsModal';
import { TransactionRecord } from '../../src/types/transaction';

describe('TransactionCenter Components', () => {
  const mockTx: TransactionRecord = {
    id: 'tx-1001',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    type: 'create_loan',
    status: 'confirmed',
    createdAt: Date.now() - 30000,
    updatedAt: Date.now(),
    account: 'GBORROWER1234567890123456789012345678901234567890123456',
    loanId: '1',
    amount: '1000',
    explorerUrl: 'https://stellar.expert/explorer/testnet/tx/0x1234567890abcdef',
  };

  it('should render TransactionStatusCard with badge, account, and explorer link', () => {
    render(<TransactionStatusCard tx={mockTx} onViewDetails={vi.fn()} />);

    expect(screen.getByText(/create loan/i)).toBeInTheDocument();
    expect(screen.getByText(/CONFIRMED/i)).toBeInTheDocument();
    expect(screen.getByText(/Explorer ↗/i)).toBeInTheDocument();
  });

  it('should render TransactionDetailsModal with copyable hash and explorer link', () => {
    render(<TransactionDetailsModal tx={mockTx} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Transaction Details/i)).toBeInTheDocument();
    expect(screen.getByText(/tx-1001/i)).toBeInTheDocument();
    expect(screen.getByText(/View on Stellar Expert ↗/i)).toBeInTheDocument();
  });
});
