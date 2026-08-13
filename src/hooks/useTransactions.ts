import { useCallback } from 'react';
import { xdr } from '@stellar/stellar-sdk';
import { transactionService } from '../services/transaction-service';
import { transactionMonitorService } from '../services/transaction-monitor';
import { useTransactionStore } from '../stores/useTransactionStore';
import { useWalletStore } from '../stores/useWalletStore';
import { TransactionRecord, TransactionStatus } from '../types/transaction';

export function useTransactions() {
  const { walletAddress, selectedWalletId, isConnected } = useWalletStore();
  const { addTransaction, updateTransactionStatus, setActiveTxId } = useTransactionStore();

  const submitTransaction = useCallback(
    async (
      type: TransactionRecord['type'],
      operation: xdr.Operation,
      loanId?: string,
      amount?: string
    ) => {
      if (!isConnected || !walletAddress || !selectedWalletId) {
        throw new Error('Wallet must be connected to submit transactions');
      }

      const txId = addTransaction({
        type,
        status: 'preparing',
        account: walletAddress,
        loanId,
        amount,
      });

      try {
        const result = await transactionService.executeTransaction(
          walletAddress,
          operation,
          selectedWalletId,
          (status: TransactionStatus) => {
            updateTransactionStatus(txId, status);
          }
        );

        if (result.status === 'confirmed' && result.hash) {
          updateTransactionStatus(txId, 'confirmed', result.hash);
        } else if (result.status === 'failed') {
          updateTransactionStatus(txId, 'failed', result.hash, result.error);
        } else if (result.hash) {
          // If in processing, start monitoring status via RPC
          transactionMonitorService.startMonitoring(txId, result.hash);
        }

        return result;
      } catch (err: any) {
        updateTransactionStatus(txId, 'failed', undefined, err.message || 'Execution error');
        throw err;
      }
    },
    [addTransaction, isConnected, selectedWalletId, updateTransactionStatus, walletAddress]
  );

  return {
    submitTransaction,
  };
}
