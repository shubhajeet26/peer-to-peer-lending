import { Account, Address, Contract, nativeToScVal, rpc, scValToNative, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';
import { sorobanServer } from '../lib/stellar-sdk';
import { CreateLoanParams, Loan, LoanStatus } from '../types/loan';

const DUMMY_ACCOUNT_ID = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';
const FALLBACK_CONTRACT_ID = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4';

export class LoanManagerService {
  private contract: Contract;

  constructor(contractId?: string) {
    const id = contractId || STELLAR_CONFIG.loanManagerContractId;
    try {
      this.contract = new Contract(id);
    } catch {
      this.contract = new Contract(FALLBACK_CONTRACT_ID);
    }
  }

  getContractAddress(): string {
    return this.contract.contractId();
  }

  buildCreateLoanOperation(params: CreateLoanParams): xdr.Operation {
    let tokenAddress = params.token;
    try {
      new Address(tokenAddress);
    } catch {
      tokenAddress = STELLAR_CONFIG.nativeTokenAddress;
    }

    const borrowerSc = new Address(params.borrower).toScVal();
    const tokenSc = new Address(tokenAddress).toScVal();
    const principalSc = nativeToScVal(params.principal, { type: 'i128' });
    const aprSc = nativeToScVal(params.interestRateBps, { type: 'u32' });
    const durationSc = nativeToScVal(params.durationSeconds, { type: 'u64' });
    const installmentsSc = nativeToScVal(params.totalInstallments, { type: 'u32' });
    const hashBytes = Buffer.from(params.purposeHash, 'hex');
    const purposeSc = nativeToScVal(hashBytes, { type: 'bytes' });

    return this.contract.call(
      'create_loan',
      borrowerSc,
      tokenSc,
      principalSc,
      aprSc,
      durationSc,
      installmentsSc,
      purposeSc
    );
  }

  buildFundLoanOperation(loanId: bigint, lenderAddress: string): xdr.Operation {
    const loanIdSc = nativeToScVal(loanId, { type: 'u64' });
    const lenderSc = new Address(lenderAddress).toScVal();

    return this.contract.call('fund_loan', loanIdSc, lenderSc);
  }

  buildRepayLoanOperation(loanId: bigint, payerAddress: string, amount: bigint): xdr.Operation {
    const loanIdSc = nativeToScVal(loanId, { type: 'u64' });
    const payerSc = new Address(payerAddress).toScVal();
    const amountSc = nativeToScVal(amount, { type: 'i128' });

    return this.contract.call('repay_loan', loanIdSc, payerSc, amountSc);
  }

  buildCancelLoanOperation(loanId: bigint, borrowerAddress: string): xdr.Operation {
    const loanIdSc = nativeToScVal(loanId, { type: 'u64' });
    const borrowerSc = new Address(borrowerAddress).toScVal();

    return this.contract.call('cancel_loan', loanIdSc, borrowerSc);
  }

  buildCheckDefaultOperation(loanId: bigint, callerAddress: string): xdr.Operation {
    const loanIdSc = nativeToScVal(loanId, { type: 'u64' });
    const callerSc = new Address(callerAddress).toScVal();

    return this.contract.call('check_and_mark_default', loanIdSc, callerSc);
  }

  async getLoan(loanId: bigint): Promise<Loan | null> {
    try {
      const loanIdSc = nativeToScVal(loanId, { type: 'u64' });
      const dummyAcc = new Account(DUMMY_ACCOUNT_ID, '0');

      const tx = new TransactionBuilder(dummyAcc, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('get_loan', loanIdSc))
        .setTimeout(30)
        .build();

      const simRes = await sorobanServer.simulateTransaction(tx);

      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        const raw = scValToNative(simRes.result.retval);
        return this.parseLoanStruct(raw);
      }
    } catch {
      // Contract uninitialized or loan not found
    }
    return null;
  }

  async getLoanCount(): Promise<bigint> {
    try {
      const dummyAcc = new Account(DUMMY_ACCOUNT_ID, '0');
      const tx = new TransactionBuilder(dummyAcc, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('get_loan_count'))
        .setTimeout(30)
        .build();

      const simRes = await sorobanServer.simulateTransaction(tx);

      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        return BigInt(scValToNative(simRes.result.retval));
      }
    } catch {
      // Fallback
    }
    return 0n;
  }

  private parseLoanStruct(raw: any): Loan {
    return {
      id: BigInt(raw.id || 0),
      borrower: raw.borrower,
      lender: raw.lender || null,
      token: raw.token,
      principal: BigInt(raw.principal || 0),
      interestRateBps: Number(raw.interest_rate_bps || 0),
      durationSeconds: Number(raw.duration_seconds || 0),
      createdAt: Number(raw.created_at || 0),
      fundedAt: Number(raw.funded_at || 0),
      maturityTimestamp: Number(raw.maturity_timestamp || 0),
      amountFunded: BigInt(raw.amount_funded || 0),
      totalRepaymentAmount: BigInt(raw.total_repayment_amount || 0),
      amountRepaid: BigInt(raw.amount_repaid || 0),
      status: Number(raw.status) as LoanStatus,
      schedule: {
        totalInstallments: Number(raw.schedule?.total_installments || 1),
        installmentsPaid: Number(raw.schedule?.installments_paid || 0),
        intervalSeconds: Number(raw.schedule?.interval_seconds || 0),
        installmentAmount: BigInt(raw.schedule?.installment_amount || 0),
        nextDueTimestamp: Number(raw.schedule?.next_due_timestamp || 0),
      },
      purposeHash: raw.purpose_hash ? Buffer.from(raw.purpose_hash).toString('hex') : '',
    };
  }
}

export const loanManagerService = new LoanManagerService();
