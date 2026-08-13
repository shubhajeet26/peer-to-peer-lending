import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '../providers/query-provider';
import { WalletProvider } from '../providers/wallet-provider';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { NetworkWarningBanner } from '../components/wallet/NetworkWarningBanner';

export const metadata: Metadata = {
  title: 'StellarLend — Decentralized Peer-to-Peer Lending Platform',
  description:
    'Production-ready decentralized P2P lending platform built on Stellar network with Soroban smart contracts, on-chain credit scores, and instant escrows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white">
        <ReactQueryProvider>
          <WalletProvider>
            <NetworkWarningBanner />
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </WalletProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
