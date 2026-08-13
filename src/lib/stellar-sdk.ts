import { Keypair, Horizon, rpc, StrKey } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';

export const sorobanServer = new rpc.Server(STELLAR_CONFIG.rpcUrl, {
  allowHttp: STELLAR_CONFIG.rpcUrl.startsWith('http://'),
});

export const horizonServer = new Horizon.Server(STELLAR_CONFIG.horizonUrl);

export function getTxExplorerUrl(txHash: string): string {
  return `${STELLAR_CONFIG.explorerBaseUrl}/tx/${txHash}`;
}

export function getAccountExplorerUrl(account: string): string {
  return `${STELLAR_CONFIG.explorerBaseUrl}/account/${account}`;
}

export function formatStellarAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address || '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
}

export function stroopsToStellar(stroops: bigint | number): string {
  const stroopsBigInt = BigInt(stroops);
  const xlms = Number(stroopsBigInt) / 10_000_000;
  return xlms.toFixed(2);
}

export function stellarToStroops(stellarAmount: number | string): bigint {
  const num = typeof stellarAmount === 'string' ? parseFloat(stellarAmount) : stellarAmount;
  if (isNaN(num) || !isFinite(num)) return 0n;
  return BigInt(Math.round(num * 10_000_000));
}
