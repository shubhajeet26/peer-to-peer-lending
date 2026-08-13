import { Account, Address, rpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';
import { parseStellarError } from '../lib/error-handler';
import { getTxExplorerUrl, horizonServer, sorobanServer } from '../lib/stellar-sdk';
import { SupportedWalletId } from '../types/wallet';
import { TransactionResult, TransactionStatus } from '../types/transaction';
import { walletService } from './wallet-service';

export class TransactionService {
  async executeTransaction(
    senderAddress: string,
    operation: xdr.Operation,
    walletId: SupportedWalletId,
    onStatusChange?: (status: TransactionStatus) => void
  ): Promise<TransactionResult> {
    try {
      // 1. Preparing
      onStatusChange?.('preparing');
      const accountResponse = await horizonServer.loadAccount(senderAddress);
      const sourceAccount = new Account(senderAddress, accountResponse.sequenceNumber());

      let transaction = new TransactionBuilder(sourceAccount, {
        fee: '100000',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      // 2. Simulating
      onStatusChange?.('simulating');
      const preparedTx = await sorobanServer.prepareTransaction(transaction);
      const simulation = await sorobanServer.simulateTransaction(preparedTx);

      if (!rpc.Api.isSimulationSuccess(simulation)) {
        throw new Error('Soroban contract simulation failed');
      }

      // 3. Awaiting Signature
      onStatusChange?.('awaiting_signature');
      const signedXdr = await walletService.signTransaction(
        preparedTx.toXDR(),
        walletId,
        STELLAR_CONFIG.networkPassphrase
      );

      // 4. Submitting
      onStatusChange?.('submitting');
      const signedTx = TransactionBuilder.fromXDR(
        signedXdr,
        STELLAR_CONFIG.networkPassphrase
      );

      const sendResult = await sorobanServer.sendTransaction(signedTx);
      if (sendResult.status === 'ERROR') {
        throw new Error('Transaction submission failed at RPC endpoint');
      }

      const hash = sendResult.hash;

      // 5. Polling for Confirmation
      let statusResult = await sorobanServer.getTransaction(hash);
      let attempts = 0;
      while (statusResult.status === 'NOT_FOUND' && attempts < 10) {
        await new Promise((res) => setTimeout(res, 1500));
        statusResult = await sorobanServer.getTransaction(hash);
        attempts++;
      }

      if (statusResult.status === 'SUCCESS') {
        onStatusChange?.('confirmed');
        return {
          status: 'confirmed',
          hash,
          explorerUrl: getTxExplorerUrl(hash),
          timestamp: Date.now(),
        };
      } else {
        onStatusChange?.('failed');
        return {
          status: 'failed',
          hash,
          error: 'Transaction failed on-chain',
          explorerUrl: getTxExplorerUrl(hash),
          timestamp: Date.now(),
        };
      }
    } catch (err: unknown) {
      onStatusChange?.('failed');
      const parsed = parseStellarError(err);
      return {
        status: 'failed',
        error: parsed.message,
        timestamp: Date.now(),
      };
    }
  }
}

export const transactionService = new TransactionService();
