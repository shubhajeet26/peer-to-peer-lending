import { describe, it, expect, beforeEach } from 'vitest';
import { Keypair } from '@stellar/stellar-sdk';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { loanManagerService } from '../../src/contracts/loan_manager';

describe('Integration Flow: Fund & Repay Loan', () => {
  beforeEach(() => {
    useTransactionStore.getState().clearTransactions();
    useWalletStore.getState().resetWalletState();
  });

  it('should track loan funding transaction lifecycle correctly', () => {
    const mockLender = Keypair.random().publicKey();
    useWalletStore.getState().setWalletAddress(mockLender);
    useWalletStore.getState().setSelectedWalletId('freighter');

    const fundOp = loanManagerService.buildFundLoanOperation(1n, mockLender);
    expect(fundOp.body().switch().name).toBe('invokeHostFunction');

    const txId = useTransactionStore.getState().addTransaction({
      type: 'fund_loan',
      status: 'submitting',
      account: mockLender,
      loanId: '1',
      amount: '1000.00',
    });

    useTransactionStore.getState().updateTransactionStatus(
      txId,
      'confirmed',
      'hash-fund-loan-1'
    );

    const tx = useTransactionStore.getState().transactions.find((t) => t.id === txId);
    expect(tx?.status).toBe('confirmed');
    expect(tx?.loanId).toBe('1');
  });

  it('should track loan repayment transaction lifecycle correctly', () => {
    const mockBorrower = Keypair.random().publicKey();

    const repayOp = loanManagerService.buildRepayLoanOperation(1n, mockBorrower, 1100_0000000n);
    expect(repayOp.body().switch().name).toBe('invokeHostFunction');

    const txId = useTransactionStore.getState().addTransaction({
      type: 'repay_loan',
      status: 'submitting',
      account: mockBorrower,
      loanId: '1',
      amount: '1100.00',
    });

    useTransactionStore.getState().updateTransactionStatus(
      txId,
      'confirmed',
      'hash-repay-loan-1'
    );

    const tx = useTransactionStore.getState().transactions.find((t) => t.id === txId);
    expect(tx?.status).toBe('confirmed');
    expect(tx?.type).toBe('repay_loan');
  });
});
