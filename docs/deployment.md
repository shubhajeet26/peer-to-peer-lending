# StellarLend — Testnet Deployment & Upgrade Strategy Guide

This guide details how to build, deploy, verify, and upgrade **StellarLend** Soroban smart contracts on the Stellar Testnet.

---

## 1. Prerequisites & Tooling

Before deploying, ensure the following tooling is installed:

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Rust**: `1.80+` with target `wasm32-unknown-unknown`
- **Stellar SDK**: `@stellar/stellar-sdk` v13+

Install WASM compilation target:
```bash
rustup target add wasm32-unknown-unknown
```

---

## 2. Deployment Workflow

### Step 1: Compile Smart Contracts
Compile Soroban Rust smart contracts to optimized WASM release binaries:
```bash
npm run contracts:build
```
*Outputs:*
- `target/wasm32-unknown-unknown/release/reputation_registry.wasm`
- `target/wasm32-unknown-unknown/release/loan_manager.wasm`

### Step 2: Deploy Contracts & Initialize State
Run the automated deployment script:
```bash
DEPLOYER_SECRET_KEY=S... npm run contracts:deploy:testnet
```

The script will:
1. Validate deployer account balance on Testnet.
2. Deploy WASM bytecode for `ReputationRegistry` and `LoanManager`.
3. Capture deployed contract IDs (`C...`).
4. Initialize contract configurations and cross-contract address references.
5. Save deployment metadata to `deployments/testnet.json`.
6. Update `.env.local` with contract IDs.

---

## 3. Verification Protocol

Run contract state and RPC verification:
```bash
npm run contracts:verify
```

Verification checks:
- Contract address StrKey Ed25519 format (`C...`, 56 characters).
- Soroban RPC target connection (`https://soroban-testnet.stellar.org`).
- Inter-contract binding between `LoanManager` and `ReputationRegistry`.

---

## 4. Contract Upgrade Strategy

To execute an on-chain WASM bytecode upgrade without losing stored contract state:

```bash
ADMIN_SECRET_KEY=S... npm run contracts:upgrade
```

The upgrade protocol:
1. Re-compiles WASM bytecode.
2. Computes SHA-256 WASM hash.
3. Invokes the admin-authorized `upgrade(env, new_wasm_hash)` entrypoint.
4. Executes `env.deployer().update_current_contract_wasm(new_wasm_hash)`.
5. Preserves all existing loan registries, schedules, and credit scores in persistent storage slots.
