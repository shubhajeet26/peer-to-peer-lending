'use client';

import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function NetworkWarningBanner() {
  const { isConnected, isCorrectNetwork, network, expectedNetwork } = useWallet();

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 text-amber-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">⚠️</span>
          <span>
            <strong>Network Mismatch Detected:</strong> Wallet is connected to{' '}
            <span className="uppercase font-bold">{network}</span>, but StellarLend expects{' '}
            <span className="uppercase font-bold text-amber-400">{expectedNetwork}</span>.
          </span>
        </div>
        <span className="text-amber-400 underline font-medium">
          Please switch network in your wallet.
        </span>
      </div>
    </div>
  );
}
