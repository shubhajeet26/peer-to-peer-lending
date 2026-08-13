import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">StellarLend</span>
            <span>— Decentralized Peer-to-Peer Lending on Stellar Soroban</span>
          </div>

          <div className="text-center md:text-right text-slate-500 text-[11px] leading-relaxed max-w-2xl">
            <strong className="text-slate-400">Regulatory Disclaimer:</strong> StellarLend is an experimental blockchain prototype built for the Stellar ecosystem. It does not represent regulated banking, deposit-taking, securities, or financial services.
          </div>
        </div>
      </div>
    </footer>
  );
}
