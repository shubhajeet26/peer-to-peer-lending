'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected, walletAddress } = useWalletStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
