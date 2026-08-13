export type SupportedWalletId = 'freighter' | 'albedo' | 'xbull' | 'hana' | 'lobstr';

export interface WalletInfo {
  id: SupportedWalletId;
  name: string;
  icon: string;
  isAvailable: boolean;
}

export interface WalletState {
  walletAddress: string | null;
  selectedWalletId: SupportedWalletId | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: string;
  expectedNetwork: string;
  isCorrectNetwork: boolean;
  connectionError: string | null;

  // Actions
  setWalletAddress: (address: string | null) => void;
  setSelectedWalletId: (walletId: SupportedWalletId | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setNetwork: (network: string) => void;
  setConnectionError: (error: string | null) => void;
  resetWalletState: () => void;
}
