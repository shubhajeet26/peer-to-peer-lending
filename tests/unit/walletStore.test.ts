import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '../../src/stores/useWalletStore';

describe('useWalletStore', () => {
  beforeEach(() => {
    useWalletStore.getState().resetWalletState();
  });

  it('should initialize with disconnected default state', () => {
    const state = useWalletStore.getState();
    expect(state.walletAddress).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.isCorrectNetwork).toBe(true);
  });

  it('should update wallet address and mark connected', () => {
    const testAddress = 'GBXGQJWVLWOYHFLVTKWV25J7AYAMY72AH7LKB647Z4G6J32QW67Z54GA';
    useWalletStore.getState().setWalletAddress(testAddress);

    const state = useWalletStore.getState();
    expect(state.walletAddress).toBe(testAddress);
    expect(state.isConnected).toBe(true);
  });

  it('should detect network mismatch correctly', () => {
    useWalletStore.getState().setNetwork('public');
    const state = useWalletStore.getState();
    expect(state.network).toBe('public');
    expect(state.isCorrectNetwork).toBe(false);
  });
});
