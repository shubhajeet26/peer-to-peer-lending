import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../../src/stores/useWalletStore';

describe('Integration Flow: Network Mismatch Guard', () => {
  beforeEach(() => {
    useWalletStore.getState().resetWalletState();
  });

  it('should flag isCorrectNetwork as false when wallet is on mainnet but app expects testnet', () => {
    useWalletStore.getState().setNetwork('public');
    useWalletStore.getState().setWalletAddress('GUSER123');

    const { isCorrectNetwork, network } = useWalletStore.getState();
    expect(isCorrectNetwork).toBe(false);
    expect(network).toBe('public');
  });

  it('should set isCorrectNetwork to true when network matches testnet', () => {
    useWalletStore.getState().setNetwork('testnet');
    useWalletStore.getState().setWalletAddress('GUSER123');

    const { isCorrectNetwork } = useWalletStore.getState();
    expect(isCorrectNetwork).toBe(true);
  });
});
