'use client';

import React from 'react';
import { ActivityEventType } from '../../types/event';

interface ActivityFilterProps {
  selectedType: ActivityEventType | 'all';
  onSelectType: (type: ActivityEventType | 'all') => void;
}

const FILTER_OPTIONS: { label: string; value: ActivityEventType | 'all' }[] = [
  { label: 'All Activity', value: 'all' },
  { label: 'Loans Created', value: 'loan_create' },
  { label: 'Loans Funded', value: 'loan_fund' },
  { label: 'Repayments', value: 'loan_repay' },
  { label: 'Completions', value: 'loan_complete' },
  { label: 'Defaults', value: 'loan_default' },
];

export function ActivityFilter({ selectedType, onSelectType }: ActivityFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = selectedType === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelectType(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              isActive
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
