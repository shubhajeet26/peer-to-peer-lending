'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { LoanStatusDistribution, TimeSeriesDataPoint } from '../../types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ActivityChartProps {
  data: TimeSeriesDataPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const hasData = data.some((d) => d.borrowed > 0 || d.lent > 0 || d.repaid > 0);

  if (!hasData) {
    return (
      <Card className="bg-slate-900/40 border-slate-800 text-center py-12">
        <CardContent className="space-y-2">
          <div className="text-3xl mb-2">📈</div>
          <h4 className="text-base font-bold text-white">No Historical Volume Recorded</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Volume charts render automatically as on-chain borrowing, lending, and repayment transactions occur on Stellar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-bold text-white">Protocol Volume over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRepaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Area type="monotone" dataKey="lent" name="Lent (XLM)" stroke="#A855F7" fillOpacity={1} fill="url(#colorLent)" />
            <Area type="monotone" dataKey="repaid" name="Repaid (XLM)" stroke="#10B981" fillOpacity={1} fill="url(#colorRepaid)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface StatusDistributionChartProps {
  distribution: LoanStatusDistribution;
}

export function StatusDistributionChart({ distribution }: StatusDistributionChartProps) {
  const chartData = [
    { name: 'Created', count: distribution.created, color: '#3B82F6' },
    { name: 'Funded', count: distribution.funded, color: '#F59E0B' },
    { name: 'Active', count: distribution.active, color: '#8B5CF6' },
    { name: 'Repaid', count: distribution.repaid, color: '#10B981' },
    { name: 'Defaulted', count: distribution.defaulted, color: '#EF4444' },
    { name: 'Cancelled', count: distribution.cancelled, color: '#64748B' },
  ];

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <Card className="bg-slate-900/40 border-slate-800 text-center py-12">
        <CardContent className="space-y-2">
          <div className="text-3xl mb-2">📊</div>
          <h4 className="text-base font-bold text-white">No Loan Distribution Data</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Loan state distribution metrics render automatically as Soroban loans enter the contract lifecycle.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader>
        <CardTitle className="text-base font-bold text-white">Loan Lifecycle Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
            <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
            />
            <Bar dataKey="count" name="Loans" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
