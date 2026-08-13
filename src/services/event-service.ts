import { rpc, scValToNative } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG } from '../config/stellar';
import { getTxExplorerUrl, sorobanServer, stroopsToStellar } from '../lib/stellar-sdk';
import { ActivityEvent, ActivityEventType, ActivityFilterOptions } from '../types/event';

export class EventService {
  private seenEventIds: Set<string> = new Set();

  async fetchContractEvents(
    startLedger?: number,
    limit = 50
  ): Promise<ActivityEvent[]> {
    try {
      // 1. Determine ledger query bounds
      let queryStartLedger = startLedger;
      if (!queryStartLedger) {
        const latestLedgerRes = await sorobanServer.getLatestLedger();
        queryStartLedger = Math.max(1, latestLedgerRes.sequence - 10000); // Last ~10k ledgers
      }

      // 2. Build filters for LoanManager and ReputationRegistry contracts
      const filters: rpc.Api.EventFilter[] = [];
      if (STELLAR_CONFIG.loanManagerContractId && STELLAR_CONFIG.loanManagerContractId.startsWith('C')) {
        filters.push({
          type: 'contract',
          contractIds: [STELLAR_CONFIG.loanManagerContractId],
        });
      }
      if (STELLAR_CONFIG.reputationRegistryContractId && STELLAR_CONFIG.reputationRegistryContractId.startsWith('C')) {
        filters.push({
          type: 'contract',
          contractIds: [STELLAR_CONFIG.reputationRegistryContractId],
        });
      }

      if (filters.length === 0) {
        return [];
      }

      // 3. Query Soroban RPC endpoint
      const response = await sorobanServer.getEvents({
        startLedger: queryStartLedger,
        filters,
        limit,
      });

      if (!response.events || response.events.length === 0) {
        return [];
      }

      // 4. Normalize and deduplicate raw events
      const normalizedEvents: ActivityEvent[] = [];

      for (const event of response.events) {
        if (!event.id) continue;
        if (this.seenEventIds.has(event.id)) continue;

        const normalized = this.normalizeEvent(event);
        if (normalized) {
          this.seenEventIds.add(event.id);
          normalizedEvents.push(normalized);
        }
      }

      return normalizedEvents.sort((a, b) => b.ledger - a.ledger);
    } catch {
      // Fail safely on network/RPC error
      return [];
    }
  }

  normalizeEvent(rawEvent: rpc.Api.EventResponse): ActivityEvent | null {
    try {
      const topicSymbols: string[] = rawEvent.topic.map((t) => {
        try {
          const val = scValToNative(t);
          return String(val);
        } catch {
          return '';
        }
      });

      const primaryTopic = topicSymbols[0] || 'unknown';
      const secondaryTopic = topicSymbols[1] || '';
      const thirdTopic = topicSymbols[2] || '';

      const valueNative = rawEvent.value ? scValToNative(rawEvent.value) : null;
      const txHash = rawEvent.txHash || '';
      const ledger = rawEvent.ledger || 0;
      const contractId = typeof rawEvent.contractId === 'string'
        ? rawEvent.contractId
        : (rawEvent.contractId ? String(rawEvent.contractId) : '');
      const timestamp = rawEvent.ledgerClosedAt
        ? new Date(rawEvent.ledgerClosedAt).getTime()
        : Date.now();

      let eventType: ActivityEventType = 'unknown';
      let actor = secondaryTopic || thirdTopic || 'Unknown Address';
      let loanId: string | undefined = undefined;
      let amount: string | undefined = undefined;
      let details = 'Contract activity recorded on-chain';

      // Parse LoanManager Events
      if (primaryTopic === 'loan_create') {
        eventType = 'loan_create';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        if (Array.isArray(valueNative)) {
          amount = stroopsToStellar(valueNative[0]);
          details = `Created loan #${loanId} for ${amount} XLM at ${Number(valueNative[1]) / 100}% APR`;
        } else {
          details = `Created loan #${loanId}`;
        }
      } else if (primaryTopic === 'loan_fund') {
        eventType = 'loan_fund';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        if (valueNative) {
          amount = stroopsToStellar(valueNative);
          details = `Funded loan #${loanId} with ${amount} XLM principal`;
        } else {
          details = `Funded loan #${loanId}`;
        }
      } else if (primaryTopic === 'loan_disburse') {
        eventType = 'loan_disburse';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        if (valueNative) {
          amount = stroopsToStellar(valueNative);
          details = `Disbursed ${amount} XLM escrow to borrower`;
        }
      } else if (primaryTopic === 'loan_repay') {
        eventType = 'loan_repay';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        if (Array.isArray(valueNative)) {
          amount = stroopsToStellar(valueNative[0]);
          const remaining = stroopsToStellar(valueNative[1]);
          const onTime = Boolean(valueNative[2]);
          details = `Submitted repayment of ${amount} XLM (${onTime ? 'On Time' : 'Late'}). Remaining: ${remaining} XLM`;
        }
      } else if (primaryTopic === 'loan_complete') {
        eventType = 'loan_complete';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        details = `Loan #${loanId} repaid in full! Credit score boosted.`;
      } else if (primaryTopic === 'loan_default') {
        eventType = 'loan_default';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        details = `Loan #${loanId} defaulted! Borrower reputation penalized.`;
      } else if (primaryTopic === 'loan_cancel') {
        eventType = 'loan_cancel';
        loanId = String(secondaryTopic);
        actor = String(thirdTopic);
        details = `Cancelled unfunded loan request #${loanId}`;
      } else if (primaryTopic.includes('rec') || primaryTopic.includes('rep')) {
        eventType = 'reputation_update';
        details = `On-chain credit reputation updated for ${actor}`;
      }

      return {
        id: rawEvent.id || `${txHash}-${ledger}`,
        type: eventType,
        contractId,
        transactionHash: txHash,
        ledger,
        timestamp,
        actor,
        loanId,
        amount,
        details,
        explorerUrl: getTxExplorerUrl(txHash),
      };
    } catch {
      return null;
    }
  }

  filterEvents(events: ActivityEvent[], options: ActivityFilterOptions): ActivityEvent[] {
    return events.filter((e) => {
      if (options.eventType && e.type !== options.eventType) return false;
      if (options.actor && e.actor.toLowerCase() !== options.actor.toLowerCase()) return false;
      if (options.loanId && e.loanId !== options.loanId) return false;
      if (options.contractId && e.contractId.toLowerCase() !== options.contractId.toLowerCase()) return false;
      return true;
    });
  }
}

export const eventService = new EventService();
