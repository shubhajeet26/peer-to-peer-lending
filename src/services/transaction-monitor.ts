import { getTxExplorerUrl } from '../lib/stellar-sdk';
import { useTransactionStore } from '../stores/useTransactionStore';
import { TransactionStatus } from '../types/transaction';
import { getSorobanTransactionStatus } from './transaction-service';

export class TransactionMonitorService {
  private activePollers: Map<string, NodeJS.Timeout> = new Map();

  startMonitoring(
    txId: string,
    hash: string,
    onStatusChange?: (status: TransactionStatus) => void,
    maxAttempts = 15,
    intervalMs = 2000
  ): void {
    if (this.activePollers.has(txId)) {
      return;
    }

    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const txRes = await getSorobanTransactionStatus(hash);

        if (txRes.status === 'SUCCESS') {
          this.stopMonitoring(txId);
          useTransactionStore.getState().updateTransactionStatus(txId, 'confirmed', hash);
          onStatusChange?.('confirmed');
        } else if (txRes.status === 'FAILED') {
          this.stopMonitoring(txId);
          const errorMsg = txRes.error || 'Transaction failed on-chain execution';
          useTransactionStore.getState().updateTransactionStatus(txId, 'failed', hash, errorMsg);
          onStatusChange?.('failed');
        } else if (attempts >= maxAttempts) {
          this.stopMonitoring(txId);
          const timeoutMsg = 'Transaction confirmation timed out after 30 seconds';
          useTransactionStore.getState().updateTransactionStatus(txId, 'failed', hash, timeoutMsg);
          onStatusChange?.('failed');
        } else {
          useTransactionStore.getState().updateTransactionStatus(txId, 'processing', hash);
          onStatusChange?.('processing');
        }
      } catch {
        if (attempts >= maxAttempts) {
          this.stopMonitoring(txId);
          useTransactionStore.getState().updateTransactionStatus(txId, 'failed', hash, 'RPC network error during polling');
          onStatusChange?.('failed');
        }
      }
    }, intervalMs);

    this.activePollers.set(txId, timer);
  }

  stopMonitoring(txId: string): void {
    const timer = this.activePollers.get(txId);
    if (timer) {
      clearInterval(timer);
      this.activePollers.delete(txId);
    }
  }

  stopAll(): void {
    this.activePollers.forEach((timer) => clearInterval(timer));
    this.activePollers.clear();
  }
}

export const transactionMonitorService = new TransactionMonitorService();
