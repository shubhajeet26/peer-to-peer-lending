import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STELLAR_CONFIG } from '../config/stellar';
import { SupportedWalletId, WalletState } from '../types/wallet';

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      walletAddress: null,
      selectedWalletId: null,
      isConnected: false,
      isConnecting: false,
      network: STELLAR_CONFIG.network,
      expectedNetwork: STELLAR_CONFIG.network,
      isCorrectNetwork: true,
      connectionError: null,

      setWalletAddress: (address: string | null) =>
        set({
          walletAddress: address,
          isConnected: Boolean(address),
          connectionError: null,
        }),

      setSelectedWalletId: (walletId: SupportedWalletId | null) =>
        set({ selectedWalletId: walletId }),

      setIsConnected: (connected: boolean) => set({ isConnected: connected }),

      setIsConnecting: (connecting: boolean) => set({ isConnecting: connecting }),

      setNetwork: (network: string) =>
        set({
          network,
          isCorrectNetwork:
            network.toLowerCase() === STELLAR_CONFIG.network.toLowerCase(),
        }),

      setConnectionError: (error: string | null) =>
        set({ connectionError: error, isConnecting: false }),

      resetWalletState: () =>
        set({
          walletAddress: null,
          selectedWalletId: null,
          isConnected: false,
          isConnecting: false,
          network: STELLAR_CONFIG.network,
          isCorrectNetwork: true,
          connectionError: null,
        }),
    }),
    {
      name: 'stellarlend-wallet-store',
      partialize: (state) => ({
        walletAddress: state.walletAddress,
        selectedWalletId: state.selectedWalletId,
        isConnected: state.isConnected,
        network: state.network,
      }),
    }
  )
);
