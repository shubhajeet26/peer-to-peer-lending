import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Loan Marketplace</h1>
        <p className="text-slate-400 text-sm">Browse active borrower loan requests and fund P2P opportunities.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketplace Route Ready</CardTitle>
          <CardDescription>
            React Query hooks configured for Soroban loan contract querying. Full marketplace cards & filters will be rendered in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
