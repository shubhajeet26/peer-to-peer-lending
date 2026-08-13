import { getAddress, isConnected, signTransaction } from '@stellar/freighter-api';
import { STELLAR_CONFIG } from '../config/stellar';
import { SupportedWalletId } from '../types/wallet';

export class WalletService {
  async isWalletAvailable(walletId: SupportedWalletId): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    if (walletId === 'freighter') {
      try {
        const res = await isConnected();
        return Boolean(res.isConnected);
      } catch {
        return false;
      }
    }
    return true;
  }

  async connectWallet(walletId: SupportedWalletId): Promise<string> {
    if (walletId === 'freighter') {
      const addrRes = await getAddress();
      if (addrRes.error || !addrRes.address) {
        throw new Error(addrRes.error || 'User declined wallet connection request');
      }
      return addrRes.address;
    }

    throw new Error(`Wallet ${walletId} connection not supported in browser environment`);
  }

  async signTransaction(
    xdr: string,
    walletId: SupportedWalletId,
    networkPassphrase?: string
  ): Promise<string> {
    const passphrase = networkPassphrase || STELLAR_CONFIG.networkPassphrase;

    if (walletId === 'freighter') {
      const res = await signTransaction(xdr, {
        networkPassphrase: passphrase,
      });
      if (res.error || !res.signedTxXdr) {
        throw new Error(res.error || 'User rejected transaction signature request');
      }
      return res.signedTxXdr;
    }

    throw new Error(`Signing not available for wallet type: ${walletId}`);
  }
}

export const walletService = new WalletService();
