import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm">Configure RPC endpoints, custom network passphrases, and notification preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Route Ready</CardTitle>
          <CardDescription>
            Network switching & RPC endpoint custom configuration will be populated in Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
