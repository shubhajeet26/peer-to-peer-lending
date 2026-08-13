'use client';

import React, { useState } from 'react';
import { TransactionDetailsModal } from '../../components/transaction/TransactionDetailsModal';
import { TransactionStatusCard } from '../../components/transaction/TransactionStatusCard';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useTransactionStore } from '../../stores/useTransactionStore';
import { TransactionRecord } from '../../types/transaction';

export default function TransactionsPage() {
  const { transactions, clearTransactions } = useTransactionStore();
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Transaction Center</h1>
          <p className="text-slate-400 text-sm">
            Monitor pending, confirmed, and failed Soroban smart contract operations.
          </p>
        </div>

        {transactions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearTransactions}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear History
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <Card className="bg-slate-900/30 border-slate-800 text-center py-12">
          <CardContent className="space-y-2">
            <div className="text-4xl mb-2">💳</div>
            <h3 className="text-lg font-bold text-white">No Transactions Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Transactions you sign and submit to the Stellar network will appear here with live execution tracking and explorer links.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionStatusCard
              key={tx.id}
              tx={tx}
              onViewDetails={(selected) => setSelectedTx(selected)}
            />
          ))}
        </div>
      )}

      <TransactionDetailsModal
        tx={selectedTx}
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
