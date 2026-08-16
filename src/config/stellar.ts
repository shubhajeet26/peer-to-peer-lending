import { Address, Networks } from '@stellar/stellar-sdk';

const DEFAULT_LOAN_MANAGER_ID = 'CAJLLUTXDVDDYPK5RZJLYHWQN3TG5C2EQ6WXCLHQ3BDFDBN4TEI45ZHV';
const DEFAULT_REPUTATION_REGISTRY_ID = 'CCMVH2MWATITZQNNYFWQVDDMVGZHFZHQWLZOOZXF2TCIP6UIFANOCXMM';
const DEFAULT_NATIVE_TOKEN_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

function validateAddress(addr: string | undefined, fallback: string): string {
  if (!addr) return fallback;
  try {
    new Address(addr);
    return addr;
  } catch {
    return fallback;
  }
}

export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    Networks.TESTNET,
  rpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
    'https://soroban-testnet.stellar.org',
  horizonUrl:
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
    'https://horizon-testnet.stellar.org',
  loanManagerContractId: validateAddress(
    process.env.NEXT_PUBLIC_LOAN_MANAGER_CONTRACT_ID,
    DEFAULT_LOAN_MANAGER_ID
  ),
  reputationRegistryContractId: validateAddress(
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID,
    DEFAULT_REPUTATION_REGISTRY_ID
  ),
  nativeTokenAddress: validateAddress(
    process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS,
    DEFAULT_NATIVE_TOKEN_ADDRESS
  ),
  explorerBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ||
    'https://stellar.expert/explorer/testnet',
};
