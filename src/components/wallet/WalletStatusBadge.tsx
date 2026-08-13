'use client';

import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { formatStellarAddress } from '../../lib/stellar-sdk';
import { Button } from '../ui/button';
import { WalletConnectModal } from './WalletConnectModal';

export function WalletStatusBadge() {
  const { walletAddress, isConnected, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-slate-200">
            {formatStellarAddress(walletAddress, 4)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="text-xs border-slate-800 hover:border-rose-900 hover:text-rose-400"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="stellar"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="text-xs font-bold"
      >
        Connect Wallet
      </Button>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
