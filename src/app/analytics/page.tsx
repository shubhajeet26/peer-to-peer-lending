'use client';

import React, { useState } from 'react';
import { ActivityChart, StatusDistributionChart } from '../../components/analytics/AnalyticsCharts';
import { MetricCard } from '../../components/analytics/MetricCard';
import { ReputationCard } from '../../components/analytics/ReputationCard';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { usePortfolioAnalytics } from '../../hooks/useAnalytics';
import { useBorrowerReputation } from '../../hooks/useReputation';
import { useWallet } from '../../hooks/useWallet';
import { stroopsToStellar } from '../../lib/stellar-sdk';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { TimeRangeOption } from '../../types/analytics';

const TIME_RANGES: { label: string; value: TimeRangeOption }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

export default function AnalyticsPage() {
  const { defaultAnalyticsTimeRange } = usePreferencesStore();
  const [timeRange, setTimeRange] = useState<TimeRangeOption>(defaultAnalyticsTimeRange);

  const { walletAddress, isConnected } = useWallet();
  const { data: analytics, isLoading, isError, refetch } = usePortfolioAnalytics(timeRange);
  const { data: borrowerRep } = useBorrowerReputation(walletAddress);

  const hasActivity =
    analytics &&
    (analytics.borrowing.totalBorrowed > 0n ||
      analytics.lending.totalLent > 0n ||
      analytics.statusDistribution.created > 0 ||
      analytics.timeSeries.some((t) => t.borrowed > 0 || t.lent > 0 || t.repaid > 0));

  return (
    <div className="space-y-8">
      {/* Header & Time Range Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Analytics</h1>
          <p className="text-slate-400 text-sm">
            Real-time portfolio metrics, volume trends, and on-chain credit performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  timeRange === range.value
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            🔄 Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      ) : isError ? (
        <Card className="bg-rose-950/20 border-rose-800 text-center py-8">
          <CardContent className="space-y-4">
            <p className="text-rose-300 text-sm">Failed to load on-chain analytics data.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Loading Analytics
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Borrowed"
              value={`${stroopsToStellar(analytics?.borrowing.totalBorrowed || 0n)} XLM`}
              subtitle={`${analytics?.borrowing.activeLoansCount || 0} Active Loans`}
              icon="💳"
              badgeText="Borrower"
            />
            <MetricCard
              title="Outstanding Balance"
              value={`${stroopsToStellar(analytics?.borrowing.outstandingAmount || 0n)} XLM`}
              subtitle={`${analytics?.borrowing.completedLoansCount || 0} Completed`}
              icon="⏳"
              badgeText="Due"
            />
            <MetricCard
              title="Total Lent"
              value={`${stroopsToStellar(analytics?.lending.totalLent || 0n)} XLM`}
              subtitle={`${analytics?.lending.activeInvestmentsCount || 0} Active Investments`}
              icon="💰"
              badgeText="Lender"
            />
            <MetricCard
              title="Repayment Success"
              value={`${analytics?.performance.repaymentRate || 100}%`}
              subtitle={`${analytics?.performance.defaultRate || 0}% Default Rate`}
              icon="✅"
              badgeText="Health"
            />
          </div>

          {/* Credit Score & Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReputationCard reputation={borrowerRep || null} />

            <MetricCard
              title="Completion Rate"
              value={`${analytics?.performance.completionRate || 100}%`}
              subtitle="Percentage of funded loans paid in full"
              icon="🏆"
              className="md:col-span-1"
            />

            <MetricCard
              title="Average Loan Size"
              value={`${stroopsToStellar(analytics?.borrowing.averageLoanAmount || 0n)} XLM`}
              subtitle="Calculated from active borrower requests"
              icon="⚖️"
              className="md:col-span-1"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityChart data={analytics?.timeSeries || []} />
            <StatusDistributionChart
              distribution={
                analytics?.statusDistribution || {
                  created: 0,
                  funded: 0,
                  active: 0,
                  repaid: 0,
                  defaulted: 0,
                  cancelled: 0,
                }
              }
            />
          </div>

          {!hasActivity && (
            <Card className="bg-slate-900/30 border-slate-800 text-center py-8">
              <CardContent className="space-y-2">
                <div className="text-3xl mb-1">ℹ️</div>
                <h4 className="text-sm font-bold text-white">Real Testnet Activity Empty State</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  StellarLend does not display fabricated/fake metrics. Once loan requests are created and funded on Soroban, analytics will update automatically in real time.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
