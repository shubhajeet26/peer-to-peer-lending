'use client';

import React from 'react';
import { BorrowerReputation } from '../../types/reputation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface ReputationCardProps {
  reputation: BorrowerReputation | null;
}

export function ReputationCard({ reputation }: ReputationCardProps) {
  const score = reputation ? reputation.creditScore : 600;

  const getTier = (score: number) => {
    if (score >= 800) return { label: 'EXCELLENT', color: 'text-emerald-400', badge: 'success' as const };
    if (score >= 700) return { label: 'GOOD', color: 'text-purple-400', badge: 'default' as const };
    if (score >= 600) return { label: 'FAIR', color: 'text-amber-400', badge: 'warning' as const };
    return { label: 'POOR / HIGH RISK', color: 'text-rose-400', badge: 'destructive' as const };
  };

  const tier = getTier(score);
  const percentage = Math.min(100, Math.max(0, ((score - 300) / 700) * 100));

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border-purple-900/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-purple-300">
          On-Chain Credit Score
        </CardTitle>
        <Badge variant={tier.badge}>{tier.label}</Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between pt-2">
          <div>
            <span className={`text-4xl sm:text-5xl font-black ${tier.color}`}>
              {score}
            </span>
            <span className="text-xs text-slate-500 font-semibold ml-2">/ 1000 Max</span>
          </div>
          <span className="text-2xl">⭐</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>300 (Min)</span>
            <span>600 (Base)</span>
            <span>1000 (Max)</span>
          </div>
        </div>

        {/* Reputation Breakdown Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950/60 p-2">
            <span className="text-slate-500 block text-[11px]">Completed Loans</span>
            <strong className="text-emerald-400 text-sm">{reputation?.completedLoans || 0}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2">
            <span className="text-slate-500 block text-[11px]">Defaulted Loans</span>
            <strong className="text-rose-400 text-sm">{reputation?.defaultedLoans || 0}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2">
            <span className="text-slate-500 block text-[11px]">On-Time Repayments</span>
            <strong className="text-purple-300 text-sm">{reputation?.onTimeRepayments || 0}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-2">
            <span className="text-slate-500 block text-[11px]">Late Repayments</span>
            <strong className="text-amber-400 text-sm">{reputation?.lateRepayments || 0}</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
