export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  networkPassphrase:
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ||
    'Test SDF Network ; July 2015',
  rpcUrl:
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ||
    'https://soroban-testnet.stellar.org',
  horizonUrl:
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ||
    'https://horizon-testnet.stellar.org',
  loanManagerContractId:
    process.env.NEXT_PUBLIC_LOAN_MANAGER_CONTRACT_ID ||
    'CB7TESTNETLOANMANAGERCONTRACTID000000000000000000000000',
  reputationRegistryContractId:
    process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_CONTRACT_ID ||
    'CC8TESTNETREPUTATIONREGISTRYCONTRACTID00000000000',
  explorerBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ||
    'https://stellar.expert/explorer/testnet',
};
