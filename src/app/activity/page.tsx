import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Real-Time Activity Feed</h1>
        <p className="text-slate-400 text-sm">Live stream of on-chain Soroban contract events (Loan Created, Funded, Repaid, Defaulted).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Feed Route Ready</CardTitle>
          <CardDescription>
            Stellar RPC WebSocket & event streaming integration will be implemented in Phase 4.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
