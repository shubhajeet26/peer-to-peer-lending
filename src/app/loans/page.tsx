'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplaceLoans } from '../../hooks/useLoans';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import { loanManagerService } from '../../contracts/loan_manager';
import { stroopsToStellar, formatStellarAddress } from '../../lib/stellar-sdk';
import { Loan, LoanStatus } from '../../types/loan';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { WalletConnectModal } from '../../components/wallet/WalletConnectModal';

export default function LoansMarketplacePage() {
  const { data: loans = [], isLoading, refetch } = useMarketplaceLoans();
  const { walletAddress, isConnected } = useWallet();
  const { submitTransaction } = useTransactions();

  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, created, active, repaid, defaulted
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, apr-high, apr-low, principal-high
  const [selectedFundLoan, setSelectedFundLoan] = useState<Loan | null>(null);
  const [funding, setFunding] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Filter & Sort Logic
  const filteredLoans = loans.filter((loan) => {
    if (statusFilter === 'created') return loan.status === LoanStatus.Created;
    if (statusFilter === 'active') return loan.status === LoanStatus.Active;
    if (statusFilter === 'repaid') return loan.status === LoanStatus.Repaid;
    if (statusFilter === 'defaulted') return loan.status === LoanStatus.Defaulted;
    return true;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    if (sortBy === 'apr-high') return b.interestRateBps - a.interestRateBps;
    if (sortBy === 'apr-low') return a.interestRateBps - b.interestRateBps;
    if (sortBy === 'principal-high') return Number(b.principal - a.principal);
    return Number(b.id - a.id); // newest default
  });

  const handleFundLoan = async () => {
    if (!selectedFundLoan) return;
    if (!isConnected || !walletAddress) {
      setIsWalletModalOpen(true);
      return;
    }

    try {
      setFunding(true);
      const operation = loanManagerService.buildFundLoanOperation(selectedFundLoan.id, walletAddress);
      const principalXlm = stroopsToStellar(selectedFundLoan.principal);

      await submitTransaction('fund_loan', operation, selectedFundLoan.id.toString(), `${principalXlm} XLM`);
      setSelectedFundLoan(null);
      refetch();
    } catch (err) {
      console.error('Funding failed:', err);
    } finally {
      setFunding(false);
    }
  };

  const handleCancelLoan = async (loanId: bigint) => {
    if (!walletAddress) return;
    try {
      const operation = loanManagerService.buildCancelLoanOperation(loanId, walletAddress);
      await submitTransaction('cancel_loan', operation, loanId.toString());
      refetch();
    } catch (err) {
      console.error('Cancellation failed:', err);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.Created:
        return <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">Open for Funding</span>;
      case LoanStatus.Funded:
      case LoanStatus.Active:
        return <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">Active Escrow</span>;
      case LoanStatus.Repaid:
        return <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">Repaid & Complete</span>;
      case LoanStatus.Defaulted:
        return <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">Defaulted</span>;
      case LoanStatus.Cancelled:
        return <span className="rounded-full bg-slate-500/20 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-500/30">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Loan Marketplace</h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse peer-to-peer loan requests on Stellar and fund transparent yield opportunities.
          </p>
        </div>
        <Link href="/loans/create">
          <Button variant="stellar" className="font-bold text-xs shadow-lg shadow-purple-950/40">
            + Request a Loan
          </Button>
        </Link>
      </div>

      {/* Filter & Sort Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2">Filter:</span>
          {[
            { id: 'all', label: 'All Loans' },
            { id: 'created', label: 'Open for Funding' },
            { id: 'active', label: 'Active Escrow' },
            { id: 'repaid', label: 'Repaid' },
            { id: 'defaulted', label: 'Defaulted' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="apr-high">Highest APR (%)</option>
            <option value="apr-low">Lowest APR (%)</option>
            <option value="principal-high">Highest Principal</option>
          </select>
        </div>
      </div>

      {/* Loans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-slate-900/50" />
            </Card>
          ))}
        </div>
      ) : sortedLoans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <span className="text-4xl">🌱</span>
            <CardTitle>No Loans Found</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              There are currently no active loan requests matching your selected filter. Be the first borrower to request a P2P loan!
            </CardDescription>
            <Link href="/loans/create">
              <Button variant="stellar" size="sm" className="mt-2 font-bold text-xs">
                Create First Loan Request →
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedLoans.map((loan) => {
            const principalXlm = stroopsToStellar(loan.principal);
            const totalRepaymentXlm = stroopsToStellar(loan.totalRepaymentAmount);
            const aprPercent = (loan.interestRateBps / 100).toFixed(1);
            const days = Math.round(loan.durationSeconds / 86400);
            const isBorrower = walletAddress?.toLowerCase() === loan.borrower.toLowerCase();

            return (
              <Card
                key={loan.id.toString()}
                className="group relative overflow-hidden transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">Loan #{loan.id.toString()}</span>
                    {getStatusBadge(loan.status)}
                  </div>
                  <CardTitle className="text-2xl font-extrabold text-white pt-2">
                    {principalXlm} <span className="text-sm font-normal text-slate-400">XLM</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Borrower: <span className="font-mono text-slate-300">{formatStellarAddress(loan.borrower)}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                    <div>
                      <div className="text-slate-500 font-medium">Interest APR</div>
                      <div className="text-sm font-bold text-emerald-400">{aprPercent}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Duration</div>
                      <div className="text-sm font-bold text-white">{days} Days</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Installments</div>
                      <div className="font-semibold text-slate-300">{loan.schedule.totalInstallments} Payments</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Repayment Obligation</div>
                      <div className="font-bold text-slate-200">{totalRepaymentXlm} XLM</div>
                    </div>
                  </div>

                  {/* Actions */}
                  {loan.status === LoanStatus.Created && (
                    <div className="pt-2">
                      {isBorrower ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelLoan(loan.id)}
                          className="w-full text-xs border-rose-900/60 text-rose-400 hover:bg-rose-950/60"
                        >
                          Cancel Request
                        </Button>
                      ) : (
                        <Button
                          variant="stellar"
                          size="sm"
                          onClick={() => setSelectedFundLoan(loan)}
                          className="w-full font-bold text-xs shadow-md shadow-purple-950/40"
                        >
                          Fund Loan ({principalXlm} XLM) →
                        </Button>
                      )}
                    </div>
                  )}

                  {loan.status === LoanStatus.Active && (
                    <div className="pt-2">
                      <Link href={isBorrower ? '/my-loans' : '/my-investments'}>
                        <Button variant="outline" size="sm" className="w-full text-xs border-purple-800/60 text-purple-300 hover:bg-purple-950/40">
                          {isBorrower ? 'Manage Repayments →' : 'View Investment Portfolio →'}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fund Loan Modal */}
      {selectedFundLoan && (
        <Dialog
          isOpen={Boolean(selectedFundLoan)}
          onClose={() => setSelectedFundLoan(null)}
          title={`Fund Loan #${selectedFundLoan.id.toString()}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              You are funding this peer-to-peer loan request on Stellar. Your principal tokens will be escrowed and automatically disbursed to the borrower.
            </p>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Principal Escrow Amount:</span>
                <span className="font-bold text-white text-sm">{stroopsToStellar(selectedFundLoan.principal)} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Yield APR:</span>
                <span className="font-bold text-emerald-400">{(selectedFundLoan.interestRateBps / 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expected Total Return:</span>
                <span className="font-extrabold text-purple-300">{stroopsToStellar(selectedFundLoan.totalRepaymentAmount)} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Borrower Address:</span>
                <span className="font-mono text-slate-300">{formatStellarAddress(selectedFundLoan.borrower)}</span>
              </div>
            </div>

            <Button
              variant="stellar"
              className="w-full py-3 font-bold text-sm"
              onClick={handleFundLoan}
              disabled={funding}
            >
              {funding ? 'Submitting Escrow Funding...' : `Confirm & Escrow ${stroopsToStellar(selectedFundLoan.principal)} XLM`}
            </Button>
          </div>
        </Dialog>
      )}

      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
