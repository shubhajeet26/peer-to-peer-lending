'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { SupportedWalletId } from '../../types/wallet';
import { Dialog } from '../ui/dialog';
import { isConnected as checkFreighterInstalled } from '@stellar/freighter-api';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { connect, isConnecting, connectionError } = useWallet();
  const [hasFreighterExtension, setHasFreighterExtension] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function detectFreighter() {
      if (typeof window === 'undefined') return;
      try {
        const res = await checkFreighterInstalled();
        if (isMounted) {
          setHasFreighterExtension(Boolean(res.isConnected));
        }
      } catch {
        if (isMounted) {
          setHasFreighterExtension(false);
        }
      }
    }

    if (isOpen) {
      detectFreighter();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleSelect = async (walletId: SupportedWalletId) => {
    try {
      await connect(walletId);
      onClose();
    } catch {
      // Error is stored in useWalletStore.connectionError
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Connect Stellar Wallet">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Connect your Stellar & Soroban compatible browser wallet to manage peer-to-peer loans, investments, and credit scores.
        </p>

        {connectionError && (
          <div className="rounded-xl bg-rose-950/80 p-3.5 text-xs text-rose-200 border border-rose-800 shadow-md">
            <strong className="block mb-0.5 font-bold text-rose-100">Connection Error:</strong>
            {connectionError}
          </div>
        )}

        {/* Primary Option: Freighter Wallet */}
        <div className="rounded-2xl border-2 border-purple-500/80 bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 p-4 shadow-lg shadow-purple-950/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/30 text-2xl border border-purple-400/40">
                🚀
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Freighter Wallet</h3>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-purple-200/70">Official Soroban Smart Contract Wallet</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pt-2 border-t border-purple-900/50">
            <span>Extension Status:</span>
            {hasFreighterExtension === null ? (
              <span className="text-slate-400">Checking browser...</span>
            ) : hasFreighterExtension ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Installed & Active
              </span>
            ) : (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                Install Extension ↗
              </a>
            )}
          </div>

          <button
            onClick={() => handleSelect('freighter')}
            disabled={isConnecting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting Freighter...
              </>
            ) : (
              <>
                <span>Connect Freighter Wallet</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        {/* Other Ecosystem Wallets */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Other Ecosystem Wallets
          </h4>

          <div className="grid gap-2">
            {[
              { id: 'albedo' as SupportedWalletId, name: 'Albedo', icon: '🌐', desc: 'Web Browser Wallet' },
              { id: 'xbull' as SupportedWalletId, name: 'xBull Wallet', icon: '🐂', desc: 'Soroban Enabled' },
              { id: 'lobstr' as SupportedWalletId, name: 'LOBSTR Wallet', icon: '🦞', desc: 'Mobile & Web Wallet' },
            ].map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleSelect(wallet.id)}
                disabled={isConnecting}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-left hover:border-purple-600/40 hover:bg-slate-800/50 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{wallet.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-slate-200">{wallet.name}</div>
                    <div className="text-[11px] text-slate-500">{wallet.desc}</div>
                  </div>
                </div>
                <span className="text-xs text-purple-400 font-medium">Connect</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
