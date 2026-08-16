import { Networks } from '@stellar/stellar-sdk';

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
  loanManagerContractId:
    process.env.NEXT_PUBLIC_LOAN_MANAGER_CONTRACT_ID ||
    'CAJLLUTXDVDDYPK5RZJLYHWQN3TG5C2EQ6WXCLHQ3BDFDBN4TEI45ZHV',
  reputationRegistryContractId:
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID ||
    'CCMVH2MWATITZQNNYFWQVDDMVGZHFZHQWLZOOZXF2TCIP6UIFANOCXMM',
  nativeTokenAddress:
    process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS ||
    'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  explorerBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ||
    'https://stellar.expert/explorer/testnet',
};
