'use client';

import React from 'react';
import { useWallet } from '../../hooks/useWallet';
import { SupportedWalletId, WalletInfo } from '../../types/wallet';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLET_OPTIONS: WalletInfo[] = [
  {
    id: 'freighter',
    name: 'Freighter Wallet',
    icon: '⚡',
    isAvailable: true,
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '🌐',
    isAvailable: true,
  },
  {
    id: 'xbull',
    name: 'xBull Wallet',
    icon: '🐂',
    isAvailable: true,
  },
  {
    id: 'lobstr',
    name: 'LOBSTR Wallet',
    icon: '🦞',
    isAvailable: true,
  },
];

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect, isConnecting, connectionError } = useWallet();

  const handleSelect = async (walletId: SupportedWalletId) => {
    try {
      await connect(walletId);
      onClose();
    } catch {
      // Error recorded in wallet store
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Connect Stellar Wallet">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Select your preferred Stellar ecosystem wallet to interact with Soroban loan contracts.
        </p>

        {connectionError && (
          <div className="rounded-lg bg-rose-950/60 p-3 text-xs text-rose-300 border border-rose-800">
            {connectionError}
          </div>
        )}

        <div className="grid gap-2">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleSelect(wallet.id)}
              disabled={isConnecting}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left hover:border-purple-600/60 hover:bg-slate-800/50 transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <div className="font-semibold text-white">{wallet.name}</div>
                  <div className="text-xs text-slate-500">Official Soroban Compatible</div>
                </div>
              </div>
              <span className="text-xs text-purple-400 font-medium">Connect →</span>
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
