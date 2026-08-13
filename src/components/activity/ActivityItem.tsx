'use client';

import React from 'react';
import { formatStellarAddress } from '../../lib/stellar-sdk';
import { ActivityEvent } from '../../types/event';
import { Badge } from '../ui/badge';

interface ActivityItemProps {
  event: ActivityEvent;
}

export function ActivityItem({ event }: ActivityItemProps) {
  const getBadgeVariant = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'loan_create':
        return 'default';
      case 'loan_fund':
        return 'warning';
      case 'loan_repay':
        return 'secondary';
      case 'loan_complete':
        return 'success';
      case 'loan_default':
        return 'destructive';
      case 'loan_cancel':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getEventTitle = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'loan_create':
        return 'Loan Request Created';
      case 'loan_fund':
        return 'Loan Funded';
      case 'loan_disburse':
        return 'Escrow Disbursed';
      case 'loan_repay':
        return 'Repayment Submitted';
      case 'loan_complete':
        return 'Loan Completed 🎉';
      case 'loan_default':
        return 'Loan Defaulted ⚠️';
      case 'loan_cancel':
        return 'Loan Request Cancelled';
      case 'reputation_update':
        return 'Reputation Updated';
      default:
        return 'Contract Event';
    }
  };

  const timeAgo = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return `${Math.max(1, diffSeconds)}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4 transition-all hover:border-slate-700/80 hover:bg-slate-900/80">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-950/60 border border-purple-800/50 text-lg">
        {event.type === 'loan_complete'
          ? '🎉'
          : event.type === 'loan_default'
          ? '⚠️'
          : event.type === 'loan_fund'
          ? '💰'
          : event.type === 'loan_repay'
          ? '💸'
          : '📜'}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white">
              {getEventTitle(event.type)}
            </span>
            <Badge variant={getBadgeVariant(event.type)}>
              {event.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <span className="text-xs text-slate-500 font-mono" title={new Date(event.timestamp).toLocaleString()}>
            {timeAgo(event.timestamp)}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{event.details}</p>

        <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-500 font-mono">
          <span>Actor: <strong className="text-slate-400">{formatStellarAddress(event.actor)}</strong></span>
          <span>Ledger: <strong className="text-slate-400">#{event.ledger}</strong></span>
          {event.explorerUrl && (
            <a
              href={event.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 hover:underline flex items-center gap-1"
            >
              Tx Explorer ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
