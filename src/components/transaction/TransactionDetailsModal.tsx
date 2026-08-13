'use client';

import React, { useState } from 'react';
import { TransactionRecord } from '../../types/transaction';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

interface TransactionDetailsModalProps {
  tx: TransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsModal({
  tx,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!tx) return null;

  const handleCopyHash = () => {
    if (tx.hash) {
      navigator.clipboard.writeText(tx.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-4 text-xs text-slate-300">
        <div>
          <label className="text-slate-500 font-semibold block mb-1">Transaction ID</label>
          <div className="rounded-lg bg-slate-950 p-2 font-mono text-slate-200">{tx.id}</div>
        </div>

        <div>
          <label className="text-slate-500 font-semibold block mb-1">Type & Action</label>
          <div className="font-semibold text-white capitalize">{tx.type.replace('_', ' ')}</div>
        </div>

        <div>
          <label className="text-slate-500 font-semibold block mb-1">Transaction Hash</label>
          {tx.hash ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-slate-950 p-2 font-mono text-slate-300 truncate">
                {tx.hash}
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyHash}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          ) : (
            <div className="text-slate-500 italic">Hash not available yet</div>
          )}
        </div>

        <div>
          <label className="text-slate-500 font-semibold block mb-1">Sender Account</label>
          <div className="rounded-lg bg-slate-950 p-2 font-mono text-slate-300 truncate">
            {tx.account}
          </div>
        </div>

        {tx.error && (
          <div className="rounded-xl border border-rose-800/80 bg-rose-950/50 p-3 text-rose-300">
            <strong className="block mb-1 font-semibold text-rose-200">Execution Error:</strong>
            {tx.error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-slate-500">
            Submitted: {new Date(tx.createdAt).toLocaleString()}
          </span>
          {tx.explorerUrl && (
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 font-semibold hover:underline"
            >
              View on Stellar Expert ↗
            </a>
          )}
        </div>
      </div>
    </Dialog>
  );
}
