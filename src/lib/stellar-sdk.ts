import { Horizon, rpc, StrKey } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';

export const sorobanServer = new rpc.Server(STELLAR_CONFIG.rpcUrl, {
  allowHttp: STELLAR_CONFIG.rpcUrl.startsWith('http://'),
});

export const horizonServer = new Horizon.Server(STELLAR_CONFIG.horizonUrl, {
  allowHttp: STELLAR_CONFIG.horizonUrl.startsWith('http://'),
});

export function isValidStellarAddress(address: string): boolean {
  return StrKey.isValidEd25519PublicKey(address) || StrKey.isValidContract(address);
}

export function formatStellarAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function stroopsToStellar(stroops: bigint | number | string): string {
  const num = typeof stroops === 'bigint' ? Number(stroops) : Number(stroops);
  return (num / 10_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function stellarToStroops(stellarAmount: number | string): bigint {
  const num = typeof stellarAmount === 'string' ? parseFloat(stellarAmount) : stellarAmount;
  return BigInt(Math.round(num * 10_000_000));
}

export function getTxExplorerUrl(txHash: string): string {
  return `${STELLAR_CONFIG.explorerBaseUrl}/tx/${txHash}`;
}

export function getAccountExplorerUrl(address: string): string {
  return `${STELLAR_CONFIG.explorerBaseUrl}/account/${address}`;
}

export function getContractExplorerUrl(contractId: string): string {
  return `${STELLAR_CONFIG.explorerBaseUrl}/contract/${contractId}`;
}
