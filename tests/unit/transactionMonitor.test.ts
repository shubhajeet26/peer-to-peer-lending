import { describe, it, expect, beforeEach } from 'vitest';
import { useTransactionStore } from '../../src/stores/useTransactionStore';

describe('Transaction Monitoring & Store Lifecycle', () => {
  beforeEach(() => {
    useTransactionStore.getState().clearTransactions();
  });

  it('should add a new transaction to the store with correct initial status', () => {
    const txId = useTransactionStore.getState().addTransaction({
      type: 'create_loan',
      status: 'preparing',
      account: 'GBORROWER123',
    });

    const txs = useTransactionStore.getState().transactions;
    expect(txs).toHaveLength(1);
    expect(txs[0].id).toBe(txId);
    expect(txs[0].status).toBe('preparing');
  });

  it('should update transaction status and store transaction hash', () => {
    const txId = useTransactionStore.getState().addTransaction({
      type: 'fund_loan',
      status: 'submitting',
      account: 'GLENDER123',
    });

    const mockHash = 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890';
    useTransactionStore.getState().updateTransactionStatus(txId, 'confirmed', mockHash);

    const updatedTx = useTransactionStore.getState().transactions.find((t) => t.id === txId);
    expect(updatedTx?.status).toBe('confirmed');
    expect(updatedTx?.hash).toBe(mockHash);
    expect(updatedTx?.explorerUrl).toContain(mockHash);
  });
});
