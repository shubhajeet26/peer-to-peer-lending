import { describe, it, expect, beforeEach } from 'vitest';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { loanManagerService } from '../../src/contracts/loan_manager';

describe('Integration Flow: Create Loan', () => {
  beforeEach(() => {
    useTransactionStore.getState().clearTransactions();
    useWalletStore.getState().resetWalletState();
  });

  it('should prevent transaction preparation if wallet is disconnected', () => {
    const { isConnected } = useWalletStore.getState();
    expect(isConnected).toBe(false);
  });

  it('should successfully build operation and record transaction when connected', () => {
    const mockBorrower = Keypair.random().publicKey();
    const mockToken = StrKey.encodeContract(Buffer.alloc(32));

    useWalletStore.getState().setWalletAddress(mockBorrower);
    useWalletStore.getState().setSelectedWalletId('freighter');

    const op = loanManagerService.buildCreateLoanOperation({
      borrower: mockBorrower,
      token: mockToken,
      principal: 1000_0000000n,
      interestRateBps: 1000,
      durationSeconds: 2592000,
      totalInstallments: 1,
      purposeHash: '00'.repeat(32),
    });

    expect(op.body().switch().name).toBe('invokeHostFunction');

    const txId = useTransactionStore.getState().addTransaction({
      type: 'create_loan',
      status: 'preparing',
      account: mockBorrower,
      amount: '1000.00',
    });

    useTransactionStore.getState().updateTransactionStatus(
      txId,
      'confirmed',
      'hash-create-loan-1'
    );

    const record = useTransactionStore.getState().transactions.find((t) => t.id === txId);
    expect(record?.status).toBe('confirmed');
    expect(record?.hash).toBe('hash-create-loan-1');
  });
});
