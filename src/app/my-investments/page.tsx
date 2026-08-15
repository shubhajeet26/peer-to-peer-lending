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
import { WalletConnectModal } from '../../components/wallet/WalletConnectModal';

export default function MyInvestmentsPage() {
  const { walletAddress, isConnected } = useWallet();
  const { data: allLoans = [], isLoading, refetch } = useMarketplaceLoans();
  const { submitTransaction } = useTransactions();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Filter loans funded by current wallet
  const myInvestments = allLoans.filter(
    (l) => walletAddress && l.lender && l.lender.toLowerCase() === walletAddress.toLowerCase()
  );

  const activeInvestments = myInvestments.filter((l) => l.status === LoanStatus.Active);
  const completedInvestments = myInvestments.filter((l) => l.status === LoanStatus.Repaid);

  const totalFundedStroops = myInvestments.reduce((sum, l) => sum + l.amountFunded, 0n);
  const totalYieldStroops = myInvestments.reduce((sum, l) => {
    if (l.status === LoanStatus.Repaid) {
      return sum + (l.totalRepaymentAmount - l.principal);
    }
    return sum;
  }, 0n);

  const handleMarkDefault = async (loanId: bigint) => {
    if (!walletAddress) return;
    try {
      const operation = loanManagerService.buildCheckDefaultOperation(loanId, walletAddress);
      await submitTransaction('check_default', operation, loanId.toString());
      refetch();
    } catch (err) {
      console.error('Mark default failed:', err);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.Active:
        return <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/30">Active Yielding</span>;
      case LoanStatus.Repaid:
        return <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">Repaid & Yield Collected</span>;
      case LoanStatus.Defaulted:
        return <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">Defaulted</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">My Investments (Lender)</h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor your funded peer-to-peer loans, interest yield, and active lender portfolio.
          </p>
        </div>
        <Link href="/loans">
          <Button variant="stellar" className="font-bold text-xs shadow-lg shadow-purple-950/40">
            Browse Loan Marketplace →
          </Button>
        </Link>
      </div>

      {!isConnected && (
        <Card className="border-purple-800/60 bg-purple-950/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Connect Wallet to View Lender Portfolio</CardTitle>
              <CardDescription className="text-purple-300">
                Connect your Stellar wallet to view your funded loans, total yield earned, and active portfolio.
              </CardDescription>
            </div>
            <Button variant="stellar" onClick={() => setIsWalletModalOpen(true)}>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Summaries */}
      {isConnected && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Total Capital Funded</div>
              <div className="text-2xl font-extrabold text-white pt-1">{stroopsToStellar(totalFundedStroops)} XLM</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Total Yield Earned</div>
              <div className="text-2xl font-extrabold text-emerald-400 pt-1">+{stroopsToStellar(totalYieldStroops)} XLM</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Active Investments</div>
              <div className="text-2xl font-extrabold text-cyan-400 pt-1">{activeInvestments.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-950/60">
            <CardContent className="p-4">
              <div className="text-xs font-semibold text-slate-400">Completed Investments</div>
              <div className="text-2xl font-extrabold text-purple-400 pt-1">{completedInvestments.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lender Investments List */}
      {isConnected && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Your Funded Investments ({myInvestments.length})</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse h-36 bg-slate-900/50" />
              ))}
            </div>
          ) : myInvestments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <span className="text-4xl">💼</span>
                <CardTitle>No Funded Investments Found</CardTitle>
                <CardDescription className="max-w-md mx-auto">
                  You have not funded any loan requests with this wallet address yet. Explore open requests in the marketplace to start earning interest!
                </CardDescription>
                <Link href="/loans">
                  <Button variant="stellar" size="sm" className="mt-2 font-bold text-xs">
                    Explore Loan Marketplace →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myInvestments.map((loan) => {
                const principalXlm = stroopsToStellar(loan.principal);
                const totalRepaymentXlm = stroopsToStellar(loan.totalRepaymentAmount);
                const amountRepaidXlm = stroopsToStellar(loan.amountRepaid);
                const yieldXlm = stroopsToStellar(loan.totalRepaymentAmount - loan.principal);
                const isPastMaturity = Date.now() / 1000 > loan.maturityTimestamp && loan.status === LoanStatus.Active;

                return (
                  <Card key={loan.id.toString()} className="border-slate-800 bg-slate-950/70 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-purple-400">Loan #{loan.id.toString()}</span>
                        {getStatusBadge(loan.status)}
                      </div>
                      <div className="text-xs text-slate-400">
                        Borrower: <span className="font-mono text-slate-200">{formatStellarAddress(loan.borrower)}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4 text-xs">
                      <div>
                        <div className="text-slate-500 font-medium">Funded Principal</div>
                        <div className="text-lg font-bold text-white">{principalXlm} XLM</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Interest APR</div>
                        <div className="text-lg font-bold text-emerald-400">{(loan.interestRateBps / 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Expected Return</div>
                        <div className="text-lg font-bold text-purple-300">{totalRepaymentXlm} XLM</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-medium">Expected Yield</div>
                        <div className="text-lg font-bold text-amber-400">+{yieldXlm} XLM</div>
                      </div>
                    </div>

                    {/* Status & Deadline */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-900 text-xs">
                      <div className="text-slate-400 space-x-4">
                        <span>
                          Repaid by Borrower: <strong className="text-emerald-400">{amountRepaidXlm} / {totalRepaymentXlm} XLM</strong>
                        </span>
                        <span>
                          Maturity Deadline: <strong className="text-white">{new Date(loan.maturityTimestamp * 1000).toLocaleDateString()}</strong>
                        </span>
                      </div>

                      {isPastMaturity && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkDefault(loan.id)}
                          className="text-xs border-rose-900/60 text-rose-400 hover:bg-rose-950/60 font-bold"
                        >
                          Mark Default (Deadline Passed)
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
