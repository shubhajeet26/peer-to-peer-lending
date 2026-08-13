'use client';

import React, { useState } from 'react';
import { ActivityFilter } from '../../components/activity/ActivityFilter';
import { ActivityItem } from '../../components/activity/ActivityItem';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useActivityFeed } from '../../hooks/useEvents';
import { useWallet } from '../../hooks/useWallet';
import { ActivityEventType } from '../../types/event';

export default function ActivityPage() {
  const [selectedType, setSelectedType] = useState<ActivityEventType | 'all'>('all');
  const [userOnly, setUserOnly] = useState(false);
  const { walletAddress } = useWallet();

  const filterOptions = {
    eventType: selectedType === 'all' ? undefined : selectedType,
    actor: userOnly && walletAddress ? walletAddress : undefined,
  };

  const { data: events = [], isLoading, isError, refetch } = useActivityFeed(filterOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Real-Time Activity Feed</h1>
          <p className="text-slate-400 text-sm">
            Live stream of on-chain Soroban contract events across StellarLend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {walletAddress && (
            <Button
              variant={userOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUserOnly(!userOnly)}
              className="text-xs"
            >
              {userOnly ? 'Show All Activity' : 'My Activity Only'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            🔄 Refresh Events
          </Button>
        </div>
      </div>

      <ActivityFilter selectedType={selectedType} onSelectType={setSelectedType} />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40"
            />
          ))}
        </div>
      ) : isError ? (
        <Card className="bg-rose-950/20 border-rose-800 text-center py-8">
          <CardContent className="space-y-4">
            <p className="text-rose-300 text-sm">Failed to retrieve on-chain Soroban contract events.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry Fetching Events
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card className="bg-slate-900/30 border-slate-800 text-center py-12">
          <CardContent className="space-y-2">
            <div className="text-4xl mb-2">📜</div>
            <h3 className="text-lg font-bold text-white">No Blockchain Activity Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No on-chain events match your active filters. Once loans are created, funded, or repaid on Soroban, live events will stream here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <ActivityItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
