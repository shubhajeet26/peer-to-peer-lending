'use client';

import React from 'react';
import { formatStellarAddress } from '../../lib/stellar-sdk';
import { TransactionRecord } from '../../types/transaction';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface TransactionStatusCardProps {
  tx: TransactionRecord;
  onViewDetails?: (tx: TransactionRecord) => void;
}

export function TransactionStatusCard({ tx, onViewDetails }: TransactionStatusCardProps) {
  const getStatusBadge = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">CONFIRMED</Badge>;
      case 'failed':
        return <Badge variant="destructive">FAILED</Badge>;
      case 'processing':
      case 'submitting':
        return <Badge variant="warning">PROCESSING</Badge>;
      case 'awaiting_signature':
        return <Badge variant="default">AWAITING SIGNATURE</Badge>;
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white capitalize">
            {tx.type.replace('_', ' ')}
          </span>
          {getStatusBadge(tx.status)}
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Account: {formatStellarAddress(tx.account)} {tx.loanId ? `| Loan #${tx.loanId}` : ''}
        </div>
        {tx.error && (
          <p className="text-xs text-rose-400 font-mono mt-1">{tx.error}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {tx.explorerUrl && (
          <a
            href={tx.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-purple-400 hover:border-purple-600 transition-colors"
          >
            Explorer ↗
          </a>
        )}
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(tx)}
            className="text-xs"
          >
            Details
          </Button>
        )}
      </div>
    </div>
  );
}
