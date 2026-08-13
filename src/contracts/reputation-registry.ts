import { Account, Address, Contract, rpc, scValToNative, TransactionBuilder } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';
import { sorobanServer } from '../lib/stellar-sdk';
import { BorrowerReputation, LenderReputation } from '../types/reputation';

const DUMMY_ACCOUNT_ID = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

export class ReputationRegistryService {
  private contract: Contract;

  constructor(contractId?: string) {
    const id = contractId || STELLAR_CONFIG.reputationRegistryContractId;
    this.contract = new Contract(id);
  }

  async getBorrowerReputation(borrowerAddress: string): Promise<BorrowerReputation> {
    try {
      const addressScVal = new Address(borrowerAddress).toScVal();
      const dummyAcc = new Account(DUMMY_ACCOUNT_ID, '0');

      const tx = new TransactionBuilder(dummyAcc, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('get_borrower_reputation', addressScVal))
        .setTimeout(30)
        .build();

      const simRes = await sorobanServer.simulateTransaction(tx);

      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        const raw = scValToNative(simRes.result.retval);
        return {
          address: raw.address || borrowerAddress,
          totalLoans: Number(raw.total_loans || 0),
          completedLoans: Number(raw.completed_loans || 0),
          defaultedLoans: Number(raw.defaulted_loans || 0),
          totalBorrowed: BigInt(raw.total_borrowed || 0),
          totalRepaid: BigInt(raw.total_repaid || 0),
          onTimeRepayments: Number(raw.on_time_repayments || 0),
          lateRepayments: Number(raw.late_repayments || 0),
          creditScore: Number(raw.credit_score || 600),
          lastUpdated: Number(raw.last_updated || 0),
        };
      }
    } catch {
      // Return fallback default values if uninitialized
    }

    return {
      address: borrowerAddress,
      totalLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      totalBorrowed: 0n,
      totalRepaid: 0n,
      onTimeRepayments: 0,
      lateRepayments: 0,
      creditScore: 600,
      lastUpdated: 0,
    };
  }

  async getLenderReputation(lenderAddress: string): Promise<LenderReputation> {
    try {
      const addressScVal = new Address(lenderAddress).toScVal();
      const dummyAcc = new Account(DUMMY_ACCOUNT_ID, '0');

      const tx = new TransactionBuilder(dummyAcc, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(this.contract.call('get_lender_reputation', addressScVal))
        .setTimeout(30)
        .build();

      const simRes = await sorobanServer.simulateTransaction(tx);

      if (rpc.Api.isSimulationSuccess(simRes) && simRes.result?.retval) {
        const raw = scValToNative(simRes.result.retval);
        return {
          address: raw.address || lenderAddress,
          totalFundedLoans: Number(raw.total_funded_loans || 0),
          totalAmountFunded: BigInt(raw.total_amount_funded || 0),
          totalYieldEarned: BigInt(raw.total_yield_earned || 0),
          lastUpdated: Number(raw.last_updated || 0),
        };
      }
    } catch {
      // Fallback
    }

    return {
      address: lenderAddress,
      totalFundedLoans: 0,
      totalAmountFunded: 0n,
      totalYieldEarned: 0n,
      lastUpdated: 0,
    };
  }
}

export const reputationRegistryService = new ReputationRegistryService();
