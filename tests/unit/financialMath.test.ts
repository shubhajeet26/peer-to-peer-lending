import { describe, it, expect } from 'vitest';
import { stroopsToStellar, stellarToStroops } from '../../src/lib/stellar-sdk';

describe('Financial Math & Stroops Conversion Safety', () => {
  it('should convert stroops BigInt to decimal XLM string correctly', () => {
    expect(stroopsToStellar(10_000_000n)).toBe('1.00');
    expect(stroopsToStellar(1000_000_000n)).toBe('100.00');
    expect(stroopsToStellar(5000000n)).toBe('0.50');
    expect(stroopsToStellar(0n)).toBe('0.00');
  });

  it('should convert decimal XLM string to stroops BigInt correctly', () => {
    expect(stellarToStroops('1')).toBe(10_000_000n);
    expect(stellarToStroops('100.5')).toBe(1005_000_000n);
    expect(stellarToStroops('0.0000001')).toBe(1n);
    expect(stellarToStroops('0')).toBe(0n);
  });

  it('should handle zero and invalid inputs safely without throwing', () => {
    expect(stellarToStroops('')).toBe(0n);
    expect(stellarToStroops('invalid')).toBe(0n);
  });

  it('should accurately calculate APR simple interest in integer stroops', () => {
    const principal = 1000_000_000n; // 100 XLM
    const interestBps = 1000n; // 10.00% APR
    const durationSeconds = 31536000n; // 1 Year
    const secondsInYear = 31536000n;

    const interest = (principal * interestBps * durationSeconds) / (10000n * secondsInYear);
    expect(interest).toBe(100_000_000n); // 10 XLM interest
    expect(principal + interest).toBe(1100_000_000n);
  });
});
