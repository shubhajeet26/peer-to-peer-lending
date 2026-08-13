import { describe, it, expect } from 'vitest';
import { parseStellarError } from '../../src/lib/error-handler';

describe('parseStellarError', () => {
  it('should parse user rejection error correctly', () => {
    const err = new Error('User rejected signature request');
    const parsed = parseStellarError(err);
    expect(parsed.code).toBe('USER_REJECTED');
    expect(parsed.message).toContain('rejected by user');
  });

  it('should parse simulation error correctly', () => {
    const err = new Error('HostError: simulation failed');
    const parsed = parseStellarError(err);
    expect(parsed.code).toBe('SIMULATION_FAILED');
  });
});
