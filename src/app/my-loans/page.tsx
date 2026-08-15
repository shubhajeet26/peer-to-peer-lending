'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplaceLoans } from '../../hooks/useLoans';
import { useWallet } from '../../hooks/useWallet';
import { useTransactions } from '../../hooks/useTransactions';
import { loanManagerService } from '../../contracts/loan_manager';
import { stroopsToStellar, stellarToStroops, formatStellarAddress } from '../../lib/stellar-sdk';
import { Loan, LoanStatus } from '../../types/loan';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { WalletConnectModal } from '../../components/wallet/WalletConnectModal';

export default function MyLoansPage() {
  const { walletAddress, isConnected } = useWallet();
  const { data: allLoans = [], isLoading, refetch } = useMarketplaceLoans();
  const { submitTransaction } = useTransactions();

  const [selectedRepayLoan, setSelectedRepayLoan] = useState<Loan | null>(null);
  const [repayAmountInput, setRepayAmountInput] = useState('');
  const [repaying, setRepaying] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Filter loans requested by current wallet
  const myLoans = allLoans.filter(
    (l) => walletAddress && l.borrower.toLowerCase() === walletAddress.toLowerCase()
  );

  // Metrics
  const activeLoans = myLoans.filter((l) => l.status === LoanStatus.Active);
  const completedLoans = myLoans.filter((l) => l.status === LoanStatus.Repaid);
  const totalBorrowedStroops = myLoans.reduce((sum, l) => sum + l.principal, 0n);
  const totalRepaidStroops = myLoans.reduce((sum, l) => sum + l.amountRepaid, 0n);

  const openRepayModal = (loan: Loan, isFull = false) => {
    setSelectedRepayLoan(loan);
    const remainingStroops = loan.totalRepaymentAmount - loan.amountRepaid;
    const defaultAmountXlm = isFull
      ? stroopsToStellar(remainingStroops)
      : stroopsToStellar(loan.schedule.installmentAmount);
    setRepayAmountInput(defaultAmountXlm);
  };

  const handleRepaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepayLoan || !walletAddress) return;

    const amountXlm = parseFloat(repayAmountInput);
    if (isNaN(amountXlm) || amountXlm <= 0) return;

    try {
      setRepaying(true);
      const amountStroops = stellarToStroops(amountXlm);
      const operation = loanManagerService.buildRepayLoanOperation(
        selectedRepayLoan.id,
        walletAddress,
        amountStroops
      );

      await submitTransaction(
        'repay_loan',
        operation,
        selectedRepayLoan.id.toString(),
        `${amountXlm} XLM`
      );

      setSelectedRepayLoan(null);
      refetch();
    } catch (err) {
      console.error('Repayment error:', err);
    } finally {
      setRepaying(false);
    }
  };

  const handleCancelLoan = async (loanId: bigint) => {
    if (!walletAddress) return;
    try {
      const operation = loanManagerService.buildCancelLoanOperation(loanId, walletAddress);
      await submitTransaction('cancel_loan', operation, loanId.toString());
      refetch();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.Created:
        return <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">Open for Funding</span>;
      case LoanStatus.Active:
        return <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">Active Repaying</span>;
      case LoanStatus.Repaid:
        return <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">Completed</span>;
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Loans (Borrower)</h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your requested peer-to-peer loans, installment schedules, and submit repayments on Stellar.
          </p>
        </div>
        <Link href="/loans/create">
          <Button variant="stellar" className="font-bold text-xs shadow-lg shadow-purple-950/40">
            + Request New Loan
          </Button>
        </Link>
      </div>

      {!isConnected && (
        <Card className="border-purple-800/60 bg-purple-950/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Connect Wallet to View Borrower Dashboard</CardTitle>
              <CardDescription className="text-purple-300">
                Connect your Stellar wallet to view your requested loans, active installment schedules, and repayment triggers.
              </CardDescription>
            </div>
            <Button variant="stellar" onClick={() => setIsWalletModalOpen(true)}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      {isConnected && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Total Borrowed</div>
              <div className="text-2xl font-extrabold text-white pt-1">{stroopsToStellar(totalBorrowedStroops)} XLM</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Total Repaid</div>
              <div className="text-2xl font-extrabold text-emerald-400 pt-1">{stroopsToStellar(totalRepaidStroops)} XLM</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Active Loans</div>
              <div className="text-2xl font-extrabold text-cyan-400 pt-1">{activeLoans.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Completed Loans</div>
              <div className="text-2xl font-extrabold text-purple-400 pt-1">{completedLoans.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Borrower Loans List */}
      {isConnected && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Your Requested Loans ({myLoans.length})</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse h-36 bg-slate-900/50" />
              ))}
            </div>
          ) : myLoans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <span className="text-4xl">📋</span>
                <CardTitle>No Borrower Loans Requested</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  You have not requested any loans with this wallet address yet. Submit your first loan request to access P2P capital!
                </CardDescription>
                <Link href="/loans/create">
                  <Button variant="stellar" size="sm" className="mt-2 font-bold text-xs">
                    Create Loan Request →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myLoans.map((loan) => {
                const principalXlm = stroopsToStellar(loan.principal);
                const totalRepaymentXlm = stroopsToStellar(loan.totalRepaymentAmount);
                const amountRepaidXlm = stroopsToStellar(loan.amountRepaid);
                const remainingStroops = loan.totalRepaymentAmount - loan.amountRepaid;
                const remainingXlm = stroopsToStellar(remainingStroops);
                const progressPercent = Math.min(
                  100,
                  Math.round((Number(loan.amountRepaid) / Number(loan.totalRepaymentAmount)) * 100) || 0
                );

                return (
                  <Card key={loan.id.toString()} className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-purple-400">Loan #{loan.id.toString()}</span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Requested Date: <span className="text-slate-200">{new Date(loan.createdAt * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 text-xs">
                      <div>
                        <div className="text-slate-500 font-medium">Principal</div>
                        <div className="text-lg font-bold text-white">{principalXlm} XLM</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Interest APR</div>
                        <div className="text-lg font-bold text-emerald-400">{(loan.interestRateBps / 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Total Obligation</div>
                        <div className="text-lg font-bold text-purple-300">{totalRepaymentXlm} XLM</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Remaining Obligation</div>
                        <div className="text-lg font-bold text-amber-400">{remainingXlm} XLM</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-400">Repayment Progress</span>
                        <span className="text-emerald-400">{amountRepaidXlm} / {totalRepaymentXlm} XLM ({progressPercent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Schedule & Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-900">
                      <div className="text-xs text-slate-400 space-x-4">
                        <span>
                          Installments Paid: <strong className="text-white">{loan.schedule.installmentsPaid} / {loan.schedule.totalInstallments}</strong>
                        </span>
                        <span>
                          Per Installment: <strong className="text-purple-300">{stroopsToStellar(loan.schedule.installmentAmount)} XLM</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {loan.status === LoanStatus.Created && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelLoan(loan.id)}
                            className="text-xs border-rose-900/60 text-rose-400 hover:bg-rose-950/60"
                          >
                            Cancel Unfunded Request
                          </Button>
                        )}

                        {loan.status === LoanStatus.Active && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRepayModal(loan, false)}
                              className="text-xs border-purple-800 text-purple-300 hover:bg-purple-950/50"
                            >
                              Repay Next Installment ({stroopsToStellar(loan.schedule.installmentAmount)} XLM)
                            </Button>
                            <Button
                              variant="stellar"
                              size="sm"
                              onClick={() => openRepayModal(loan, true)}
                              className="text-xs font-bold"
                            >
                              Repay Full Remaining ({remainingXlm} XLM) →
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Repay Loan Modal */}
      {selectedRepayLoan && (
        <Dialog
          isOpen={Boolean(selectedRepayLoan)}
          onClose={() => setSelectedRepayLoan(null)}
          title={`Repay Loan #${selectedRepayLoan.id.toString()}`}
        >
          <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Submit an installment or full loan repayment. Repayments boost your on-chain credit score in the Reputation Registry.
            </p>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Repayment Amount (XLM)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.0000001"
                  step="any"
                  value={repayAmountInput}
                  onChange={(e) => setRepayAmountInput(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                />
                <span className="absolute right-4 top-2.5 text-xs font-bold text-purple-400">XLM</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Remaining Obligation:</span>
                <span className="font-bold text-white">{stroopsToStellar(selectedRepayLoan.totalRepaymentAmount - selectedRepayLoan.amountRepaid)} XLM</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Installment:</span>
                <span className="font-semibold text-purple-300">{stroopsToStellar(selectedRepayLoan.schedule.installmentAmount)} XLM</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="stellar"
              className="w-full py-3 font-bold text-sm"
              disabled={repaying}
            >
              {repaying ? 'Submitting Repayment...' : `Submit Repayment (${repayAmountInput} XLM) →`}
            </Button>
          </form>
        </Dialog>
      )}

      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
