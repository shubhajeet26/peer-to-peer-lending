import { useCallback } from 'react';
import { walletService } from '../services/wallet-service';
import { useWalletStore } from '../stores/useWalletStore';
import { SupportedWalletId } from '../types/wallet';

export function useWallet() {
  const {
    walletAddress,
    selectedWalletId,
    isConnected,
    isConnecting,
    network,
    expectedNetwork,
    isCorrectNetwork,
    connectionError,
    setWalletAddress,
    setSelectedWalletId,
    setIsConnected,
    setIsConnecting,
    setNetwork,
    setConnectionError,
    resetWalletState,
  } = useWalletStore();

  const connect = useCallback(
    async (walletId: SupportedWalletId = 'freighter') => {
      setIsConnecting(true);
      setConnectionError(null);
      try {
        const address = await walletService.connectWallet(walletId);
        setWalletAddress(address);
        setSelectedWalletId(walletId);
        setIsConnected(true);
      } catch (err: any) {
        setConnectionError(err.message || 'Failed to connect wallet');
        resetWalletState();
      } finally {
        setIsConnecting(false);
      }
    },
    [
      setConnectionError,
      setIsConnected,
      setIsConnecting,
      setSelectedWalletId,
      setWalletAddress,
      resetWalletState,
    ]
  );

  const disconnect = useCallback(() => {
    resetWalletState();
  }, [resetWalletState]);

  return {
    walletAddress,
    selectedWalletId,
    isConnected,
    isConnecting,
    network,
    expectedNetwork,
    isCorrectNetwork,
    connectionError,
    connect,
    disconnect,
    setNetwork,
  };
}
