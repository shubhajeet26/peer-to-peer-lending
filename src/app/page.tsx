'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useWallet } from '../hooks/useWallet';

export default function LandingPage() {
  const { isConnected } = useWallet();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-8">
        <Badge variant="default" className="px-4 py-1 text-sm bg-purple-900/60 text-purple-300 border border-purple-700/50">
          ✨ Soroban Smart Contract Powered P2P Lending
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-400 bg-clip-text text-transparent leading-tight">
          Decentralized Loans.<br />Transparent Credit Scores.
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Borrow and lend Stellar assets (XLM, USDC) directly peer-to-peer. Zero middleman fees, automated Soroban smart contract escrows, and verifiable on-chain credit history.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/loans">
            <Button variant="stellar" size="lg" className="font-extrabold shadow-xl">
              Explore Loan Marketplace →
            </Button>
          </Link>
          <Link href="/loans/create">
            <Button variant="outline" size="lg" className="font-bold border-slate-700">
              Request a Loan
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <div className="text-3xl mb-2">🔒</div>
            <CardTitle>Automated Escrows</CardTitle>
            <CardDescription>
              Soroban smart contracts handle principal escrow, automatic borrower disbursement, and installment collection securely.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <div className="text-3xl mb-2">⭐</div>
            <CardTitle>On-Chain Reputation</CardTitle>
            <CardDescription>
              Dynamic credit score engine (300-1000) that updates on-chain with every completed loan and timely repayment.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <div className="text-3xl mb-2">⚡</div>
            <CardTitle>Instant Settlement</CardTitle>
            <CardDescription>
              Built on Stellar network with ~5 second transaction finality and sub-cent network execution fees.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
