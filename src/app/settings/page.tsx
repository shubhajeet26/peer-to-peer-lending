'use client';

import React from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { STELLAR_CONFIG } from '../../config/stellar';
import { useBorrowerReputation, useLenderReputation } from '../../hooks/useReputation';
import { useWallet } from '../../hooks/useWallet';
import { formatStellarAddress, stroopsToStellar } from '../../lib/stellar-sdk';
import { usePreferencesStore } from '../../stores/usePreferencesStore';

export default function SettingsPage() {
  const { walletAddress, selectedWalletId, isConnected, network, isCorrectNetwork, disconnect } = useWallet();
  const { data: borrowerRep } = useBorrowerReputation(walletAddress);
  const { data: lenderRep } = useLenderReputation(walletAddress);

  const {
    displayCurrency,
    defaultAnalyticsTimeRange,
    notificationsEnabled,
    activitySoundEnabled,
    compactView,
    setDisplayCurrency,
    setDefaultAnalyticsTimeRange,
    setNotificationsEnabled,
    setActivitySoundEnabled,
    setCompactView,
    resetPreferences,
  } = usePreferencesStore();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings & Preferences</h1>
        <p className="text-slate-400 text-sm">
          Manage your connected wallet, Stellar network environment, and application preferences.
        </p>
      </div>

      {/* 1. Wallet Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Wallet</CardTitle>
              <CardDescription>Status and active public key configuration.</CardDescription>
            </div>
            <Badge variant={isConnected ? 'success' : 'secondary'}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {isConnected && walletAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                <span className="text-slate-500 font-semibold block">Wallet Type</span>
                <span className="font-bold text-white capitalize">{selectedWalletId || 'Freighter'}</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
                <span className="text-slate-500 font-semibold block">Public Key Address</span>
                <span className="font-mono text-purple-300 break-all">{walletAddress}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400">No Stellar wallet currently connected.</p>
          )}

          {isConnected && (
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={disconnect} className="text-xs text-rose-400 border-rose-900/50 hover:bg-rose-950/40">
                Disconnect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Network Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stellar Network Environment</CardTitle>
              <CardDescription>Configured Soroban RPC endpoints and passphrase.</CardDescription>
            </div>
            <Badge variant={isCorrectNetwork ? 'default' : 'warning'}>
              {STELLAR_CONFIG.network.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500 font-semibold block">Network Passphrase</span>
              <span className="font-mono text-slate-300">{STELLAR_CONFIG.networkPassphrase}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500 font-semibold block">Soroban RPC Node</span>
              <span className="font-mono text-slate-300 truncate block">{STELLAR_CONFIG.rpcUrl}</span>
            </div>
          </div>

          {!isCorrectNetwork && (
            <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 p-3 text-amber-300">
              ⚠️ Your wallet is on <strong className="uppercase">{network}</strong>. Please switch to <strong className="uppercase">{STELLAR_CONFIG.network}</strong> in your extension.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
          <CardDescription>Persistent client-side display settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="font-bold text-white block text-sm">Display Currency</span>
              <span className="text-slate-500">Default currency denomination for loan principal amounts.</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={displayCurrency === 'XLM' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayCurrency('XLM')}
              >
                XLM
              </Button>
              <Button
                variant={displayCurrency === 'USDC' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDisplayCurrency('USDC')}
              >
                USDC
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="font-bold text-white block text-sm">Default Analytics Time Range</span>
              <span className="text-slate-500">Initial date interval selected on Analytics dashboard.</span>
            </div>
            <select
              value={defaultAnalyticsTimeRange}
              onChange={(e) => setDefaultAnalyticsTimeRange(e.target.value as any)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-600"
            >
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div>
              <span className="font-bold text-white block text-sm">Notifications & Alerts</span>
              <span className="text-slate-500">Enable in-app toasts for on-chain loan state updates.</span>
            </div>
            <Button
              variant={notificationsEnabled ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <span className="text-slate-500">Reset preferences to default settings.</span>
            <Button variant="outline" size="sm" onClick={resetPreferences} className="text-xs">
              Reset Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. On-Chain Account Information */}
      {isConnected && walletAddress && (
        <Card>
          <CardHeader>
            <CardTitle>On-Chain Account Summary</CardTitle>
            <CardDescription>Metrics retrieved directly from Soroban Reputation Registry.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500">Credit Score</span>
              <span className="text-lg font-bold text-purple-400 block">{borrowerRep ? borrowerRep.creditScore : 600}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500">Total Borrowed</span>
              <span className="text-lg font-bold text-white block">
                {borrowerRep ? stroopsToStellar(borrowerRep.totalBorrowed) : '0.00'} XLM
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500">Total Funded (Lent)</span>
              <span className="text-lg font-bold text-emerald-400 block">
                {lenderRep ? stroopsToStellar(lenderRep.totalAmountFunded) : '0.00'} XLM
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1">
              <span className="text-slate-500">Yield Earned</span>
              <span className="text-lg font-bold text-purple-300 block">
                {lenderRep ? stroopsToStellar(lenderRep.totalYieldEarned) : '0.00'} XLM
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
