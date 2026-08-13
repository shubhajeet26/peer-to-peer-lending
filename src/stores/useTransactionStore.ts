import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTxExplorerUrl } from '../lib/stellar-sdk';
import { TransactionRecord, TransactionStatus, TransactionStoreState } from '../types/transaction';

export const useTransactionStore = create<TransactionStoreState>()(
  persist(
    (set, get) => ({
      transactions: [],
      activeTxId: null,

      addTransaction: (txData) => {
        const id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const now = Date.now();
        const newRecord: TransactionRecord = {
          ...txData,
          id,
          createdAt: now,
          updatedAt: now,
          explorerUrl: txData.hash ? getTxExplorerUrl(txData.hash) : undefined,
        };

        set((state) => ({
          transactions: [newRecord, ...state.transactions],
          activeTxId: id,
        }));

        return id;
      },

      updateTransactionStatus: (id, status, hash, error) => {
        set((state) => ({
          transactions: state.transactions.map((tx) => {
            if (tx.id !== id) return tx;
            const updatedHash = hash || tx.hash;
            return {
              ...tx,
              status,
              hash: updatedHash,
              error: error || tx.error,
              updatedAt: Date.now(),
              explorerUrl: updatedHash ? getTxExplorerUrl(updatedHash) : tx.explorerUrl,
            };
          }),
        }));
      },

      setActiveTxId: (id) => set({ activeTxId: id }),

      clearTransactions: () => set({ transactions: [], activeTxId: null }),
    }),
    {
      name: 'stellarlend-transaction-store',
      partialize: (state) => ({
        transactions: state.transactions.slice(0, 50), // Store max 50 recent transactions
      }),
    }
  )
);
