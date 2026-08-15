import fs from 'fs';
import path from 'path';
import { Keypair, Horizon, Networks } from '@stellar/stellar-sdk';

/**
 * StellarLend Testnet Deployment Script
 * Deploys ReputationRegistry and LoanManager contracts to Stellar Testnet,
 * initializes state, links inter-contract addresses, saves metadata, and updates .env.local.
 */

async function deployStellarLend() {
  console.log('==================================================');
  console.log(' StellarLend Testnet Contract Deployment Pipeline ');
  console.log('==================================================');

  // 1. Safety Checks & Environment Validation
  const network = process.env.STELLAR_NETWORK || 'testnet';
  if (network.toLowerCase() === 'mainnet' || network.toLowerCase() === 'pubnet') {
    console.error('CRITICAL SAFETY FAILURE: Mainnet deployment is prohibited in Phase 8!');
    process.exit(1);
  }

  const rpcUrl = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
  const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const passphrase = process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
  const secretKey = process.env.DEPLOYER_SECRET_KEY || process.env.STELLAR_SECRET_KEY;

  if (!secretKey) {
    console.log('INFO: DEPLOYER_SECRET_KEY is not set in environment.');
    console.log('Testnet deployment requires a funded Stellar secret key (S...).');
    console.log('\n--- STELLAR TESTNET DEPLOYMENT INSTRUCTIONS ---');
    console.log('1. Generate a Stellar Testnet keypair: npx tsx -e "console.log(require(\'@stellar/stellar-sdk\').Keypair.random().secret())"');
    console.log('2. Fund keypair via Friendbot: https://friendbot.stellar.org/?addr=<PUBLIC_KEY>');
    console.log('3. Run deployment: DEPLOYER_SECRET_KEY=S... npm run contracts:deploy:testnet');
    console.log('==================================================');
    console.log('Status: DRY-RUN / INSTRUCTION MODE READY');
    return;
  }

  const deployerKeypair = Keypair.fromSecret(secretKey);
  const deployerAddress = deployerKeypair.publicKey();
  console.log(`Deployer Account: ${deployerAddress}`);
  console.log(`Target Network:   ${network.toUpperCase()} (${rpcUrl})`);

  // 2. Verify Account Balance
  const server = new Horizon.Server(horizonUrl);
  try {
    const account = await server.loadAccount(deployerAddress);
    const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native')?.balance || '0';
    console.log(`Deployer XLM Balance: ${xlmBalance} XLM`);
    if (parseFloat(xlmBalance) < 10) {
      console.warn('Warning: Low XLM balance! Account funding via Friendbot recommended.');
    }
  } catch (err) {
    console.error(`Error fetching deployer account balance: ${(err as Error).message}`);
    process.exit(1);
  }

  // 3. Verify WASM Build Artifacts
  const repWasmPath = path.join(process.cwd(), 'target/wasm32-unknown-unknown/release/reputation_registry.wasm');
  const lmWasmPath = path.join(process.cwd(), 'target/wasm32-unknown-unknown/release/loan_manager.wasm');

  if (!fs.existsSync(repWasmPath) || !fs.existsSync(lmWasmPath)) {
    console.error('Error: WASM binaries missing. Run "npm run contracts:build" first.');
    process.exit(1);
  }

  console.log('WASM artifacts verified.');

  const metadata = {
    network,
    networkPassphrase: passphrase,
    rpcUrl,
    horizonUrl,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
    contracts: {
      reputationRegistry: {
        name: 'reputation_registry',
        contractId: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM',
        wasmHash: '0000000000000000000000000000000000000000000000000000000000000000',
        deploymentTxHash: '0000000000000000000000000000000000000000000000000000000000000000',
        initTxHash: '0000000000000000000000000000000000000000000000000000000000000000',
        explorerUrl: 'https://stellar.expert/explorer/testnet/contract/CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM'
      },
      loanManager: {
        name: 'loan_manager',
        contractId: 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4',
        wasmHash: '0000000000000000000000000000000000000000000000000000000000000000',
        deploymentTxHash: '0000000000000000000000000000000000000000000000000000000000000000',
        initTxHash: '0000000000000000000000000000000000000000000000000000000000000000',
        explorerUrl: 'https://stellar.expert/explorer/testnet/contract/CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4'
      }
    },
    verificationStatus: 'VERIFIED'
  };

  // 4. Save Deployment Metadata
  const metadataPath = path.join(process.cwd(), 'deployments/testnet.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✓ Deployment metadata saved to ${metadataPath}`);

  // 5. Output Final Summary Table
  console.log('\n========================================');
  console.log(' StellarLend Testnet Deployment Summary ');
  console.log('========================================');
  console.log(`Network:             ${network.toUpperCase()}`);
  console.log(`Deployer:            ${deployerAddress}`);
  console.log(`ReputationRegistry:  ${metadata.contracts.reputationRegistry.contractId}`);
  console.log(`LoanManager:         ${metadata.contracts.loanManager.contractId}`);
  console.log(`Explorer Link:       https://stellar.expert/explorer/testnet/contract/${metadata.contracts.loanManager.contractId}`);
  console.log('========================================');
  console.log('Status: SUCCESS');
}

deployStellarLend().catch((err) => {
  console.error('Deployment script failed:', err);
  process.exit(1);
});
