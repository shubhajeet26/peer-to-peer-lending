import { getAddress, isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
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
      // 1. Request access permission from Freighter extension (triggers connection modal)
      try {
        const accessRes = await requestAccess();
        if (accessRes && accessRes.address) {
          return accessRes.address;
        }
        if (accessRes && accessRes.error) {
          const errMsg = typeof accessRes.error === 'string' ? accessRes.error : 'Freighter access request failed.';
          throw new Error(errMsg);
        }
      } catch (err: any) {
        if (err.message && (err.message.includes('declined') || err.message.includes('rejected'))) {
          throw err;
        }
      }

      // 2. Fallback to getAddress() if access was already authorized
      const addrRes = await getAddress();
      if (addrRes && addrRes.address) {
        return addrRes.address;
      }

      const errorMessage = addrRes && addrRes.error
        ? (typeof addrRes.error === 'string' ? addrRes.error : 'Connection denied by user')
        : 'Freighter extension is locked or access request was cancelled. Please unlock Freighter and try again.';

      throw new Error(errorMessage);
    }

    throw new Error(`Wallet connector for "${walletId}" is coming soon. Please use Freighter Wallet for Soroban smart contracts.`);
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
        const errMsg = typeof res.error === 'string' ? res.error : 'User rejected transaction signature request';
        throw new Error(errMsg);
      }
      return res.signedTxXdr;
    }

    throw new Error(`Signing not available for wallet type: ${walletId}`);
  }
}

export const walletService = new WalletService();
