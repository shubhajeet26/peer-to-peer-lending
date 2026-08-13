import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
        <p className="text-slate-400 text-sm">Protocol total volume, active loan stats, interest distributions, and credit default metrics.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Route Ready</CardTitle>
          <CardDescription>
            Platform-wide TVL, historical yield performance, and default risk analytics will be populated in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
