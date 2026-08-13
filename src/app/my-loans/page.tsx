import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function MyLoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Loans (Borrower)</h1>
        <p className="text-slate-400 text-sm">Track your requested loans, upcoming installments, and repayment schedules.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Borrower Dashboard Route Ready</CardTitle>
          <CardDescription>
            Repayment transaction triggers & schedule monitoring will be populated in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
