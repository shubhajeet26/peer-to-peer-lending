import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Overview Dashboard</h1>
        <p className="text-slate-400 text-sm">Monitor your active loans, investments, and credit reputation score.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Foundation Ready</CardTitle>
          <CardDescription>
            Core state management and Soroban contract service layer configured. Full dashboard widgets will be populated in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
