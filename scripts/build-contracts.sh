#!/usr/bin/env bash
set -e

echo "=================================================="
echo " Building Soroban Smart Contracts for StellarLend "
echo "=================================================="

# Check Rust & WASM Target Installation
if ! command -v cargo &> /dev/null; then
    echo "Error: cargo is not installed. Please install Rust and Cargo."
    exit 1
fi

echo "Compiling Soroban smart contracts to WASM..."
cargo build --target wasm32-unknown-unknown --release

REP_WASM="target/wasm32-unknown-unknown/release/reputation_registry.wasm"
LM_WASM="target/wasm32-unknown-unknown/release/loan_manager.wasm"

if [ ! -f "$REP_WASM" ]; then
    echo "Error: Failed to find reputation_registry.wasm artifact!"
    exit 1
fi

if [ ! -f "$LM_WASM" ]; then
    echo "Error: Failed to find loan_manager.wasm artifact!"
    exit 1
fi

echo "✓ reputation_registry.wasm built successfully ($(du -h "$REP_WASM" | cut -f1))"
echo "✓ loan_manager.wasm built successfully ($(du -h "$LM_WASM" | cut -f1))"
echo "=================================================="
echo " Contracts Build Complete! "
echo "=================================================="
