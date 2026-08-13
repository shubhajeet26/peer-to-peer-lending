import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function MyInvestmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Investments (Lender)</h1>
        <p className="text-slate-400 text-sm">Monitor your funded loans, total yield earned, and active lender portfolio.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lender Portfolio Route Ready</CardTitle>
          <CardDescription>
            Investment performance metrics & interest yield charts will be populated in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
