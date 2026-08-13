import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Transaction Center</h1>
        <p className="text-slate-400 text-sm">Track your pending, confirmed, and failed Soroban contract transactions with explorer links.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Center Route Ready</CardTitle>
          <CardDescription>
            Visual transaction monitoring, raw XDR inspection, and retry interface will be implemented in Phase 4.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
