import { describe, it, expect } from 'vitest';
import { Keypair, StrKey } from '@stellar/stellar-sdk';
import { loanManagerService } from '../../src/contracts/loan_manager';

describe('LoanManagerService Operation Builders', () => {
  const mockBorrower = Keypair.random().publicKey();
  const mockLender = Keypair.random().publicKey();
  const mockToken = StrKey.encodeContract(Buffer.alloc(32));

  it('should build create_loan operation correctly', () => {
    const op = loanManagerService.buildCreateLoanOperation({
      borrower: mockBorrower,
      token: mockToken,
      principal: 1000_0000000n,
      interestRateBps: 1000,
      durationSeconds: 2592000,
      totalInstallments: 4,
      purposeHash: '00'.repeat(32),
    });

    expect(op.body().switch().name).toBe('invokeHostFunction');
  });

  it('should build fund_loan operation correctly', () => {
    const op = loanManagerService.buildFundLoanOperation(1n, mockLender);
    expect(op.body().switch().name).toBe('invokeHostFunction');
  });

  it('should build repay_loan operation correctly', () => {
    const op = loanManagerService.buildRepayLoanOperation(1n, mockBorrower, 250_0000000n);
    expect(op.body().switch().name).toBe('invokeHostFunction');
  });

  it('should build cancel_loan operation correctly', () => {
    const op = loanManagerService.buildCancelLoanOperation(1n, mockBorrower);
    expect(op.body().switch().name).toBe('invokeHostFunction');
  });
});
