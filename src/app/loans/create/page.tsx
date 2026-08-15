'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../../../hooks/useWallet';
import { useTransactions } from '../../../hooks/useTransactions';
import { loanManagerService } from '../../../contracts/loan_manager';
import { STELLAR_CONFIG } from '../../../config/stellar';
import { stellarToStroops, stroopsToStellar } from '../../../lib/stellar-sdk';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { WalletConnectModal } from '../../../components/wallet/WalletConnectModal';

export default function CreateLoanPage() {
  const router = useRouter();
  const { walletAddress, isConnected } = useWallet();
  const { submitTransaction } = useTransactions();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Form State
  const [principalInput, setPrincipalInput] = useState('100');
  const [interestRatePercent, setInterestRatePercent] = useState('10'); // 10%
  const [durationDays, setDurationDays] = useState('30'); // 30 days
  const [installmentsCount, setInstallmentsCount] = useState('4');
  const [purposeDescription, setPurposeDescription] = useState('Working capital for small business inventory purchase.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Computed Values
  const principalAmount = parseFloat(principalInput) || 0;
  const aprPercent = parseFloat(interestRatePercent) || 0;
  const days = parseInt(durationDays) || 1;
  const installments = parseInt(installmentsCount) || 1;

  const durationSeconds = days * 86400;
  const interestRateBps = Math.round(aprPercent * 100);

  // Fixed-point interest calculation (APR)
  // Interest = (Principal * RateBps * Duration) / (10,000 * 31,536,000)
  const estimatedInterestXlm = (principalAmount * aprPercent * (days / 365)) / 100;
  const totalRepaymentXlm = principalAmount + estimatedInterestXlm;
  const installmentAmountXlm = totalRepaymentXlm / Math.max(1, installments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isConnected || !walletAddress) {
      setIsWalletModalOpen(true);
      return;
    }

    if (principalAmount <= 0) {
      setErrorMsg('Principal amount must be greater than 0 XLM.');
      return;
    }

    if (aprPercent <= 0 || aprPercent > 100) {
      setErrorMsg('Interest rate must be between 0.1% and 100%.');
      return;
    }

    if (days < 1 || days > 1825) {
      setErrorMsg('Duration must be between 1 day and 5 years (1825 days).');
      return;
    }

    if (installments < 1 || installments > 120) {
      setErrorMsg('Total installments must be between 1 and 120.');
      return;
    }

    try {
      setSubmitting(true);
      const principalStroops = stellarToStroops(principalAmount);

      // Compute SHA-256 purpose hash from text description
      const encoder = new TextEncoder();
      const data = encoder.encode(purposeDescription || 'Default Loan Request');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const operation = loanManagerService.buildCreateLoanOperation({
        borrower: walletAddress,
        token: STELLAR_CONFIG.nativeTokenAddress,
        principal: principalStroops,
        interestRateBps,
        durationSeconds,
        totalInstallments: installments,
        purposeHash: hashHex,
      });

      await submitTransaction('create_loan', operation, undefined, `${principalAmount} XLM`);
      router.push('/my-loans');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create loan request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Loan Request</h1>
        <p className="mt-1 text-sm text-slate-400">
          Specify your borrowing terms. Lenders can review and fund your request directly on the Stellar network.
        </p>
      </div>

      {!isConnected && (
        <div className="flex items-center justify-between rounded-2xl border border-purple-800/60 bg-purple-950/40 p-4 text-purple-200 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-bold text-white text-sm">Wallet Connection Required</div>
              <div className="text-xs text-purple-300">Connect your Stellar wallet to authorize loan creation transactions.</div>
            </div>
          </div>
          <Button variant="stellar" size="sm" onClick={() => setIsWalletModalOpen(true)}>
            Connect Wallet
          </Button>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-800/80 bg-rose-950/60 p-4 text-xs text-rose-300">
          <strong className="font-bold">Error: </strong>
          {errorMsg}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6 md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Loan Parameters</CardTitle>
              <CardDescription>Configure borrowing amount, interest APR, and repayment term.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Principal Amount (XLM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={principalInput}
                    onChange={(e) => setPrincipalInput(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                    placeholder="100"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-purple-400">XLM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Interest Rate (APR %)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={interestRatePercent}
                      onChange={(e) => setInterestRatePercent(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                      placeholder="10"
                    />
                    <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1825"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Repayment Installments
                </label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="1">1 Lump Sum Payment</option>
                  <option value="2">2 Installments</option>
                  <option value="4">4 Installments</option>
                  <option value="6">6 Installments</option>
                  <option value="12">12 Installments</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Loan Purpose & Description
                </label>
                <textarea
                  rows={3}
                  value={purposeDescription}
                  onChange={(e) => setPurposeDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                  placeholder="Describe your collateral or purpose..."
                />
              </div>

              <Button
                type="submit"
                variant="stellar"
                className="w-full py-3 text-sm font-bold shadow-lg shadow-purple-950/40"
                disabled={submitting}
              >
                {submitting ? 'Submitting to Soroban...' : 'Create Loan Request →'}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Real-time Calculation Summary Card */}
        <div className="md:col-span-5">
          <Card className="border-purple-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/40 sticky top-24">
            <CardHeader>
              <CardTitle className="text-purple-300">Loan Repayment Summary</CardTitle>
              <CardDescription>Live breakdown of financial obligations and schedules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Requested Principal</span>
                <span className="font-bold text-white text-sm">{principalAmount.toFixed(2)} XLM</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Estimated Interest ({aprPercent}%)</span>
                <span className="font-bold text-amber-400">+{estimatedInterestXlm.toFixed(2)} XLM</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-400">Total Repayment Obligation</span>
                <span className="font-extrabold text-emerald-400 text-base">{totalRepaymentXlm.toFixed(2)} XLM</span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Installments</span>
                  <span className="font-semibold text-purple-300">{installments} Payment{installments > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Per Installment</span>
                  <span className="font-bold text-white">{installmentAmountXlm.toFixed(2)} XLM</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Interval Frequency</span>
                  <span className="font-medium text-slate-300">Every {Math.round(days / installments)} Days</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                * Note: Loan request will be posted on-chain and escrows lender funds automatically upon full funding.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
