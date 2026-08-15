import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletConnectModal } from '../../src/components/wallet/WalletConnectModal';

describe('WalletConnectModal Component', () => {
  it('should not render content when isOpen is false', () => {
    const { container } = render(<WalletConnectModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render wallet extension options when isOpen is true', () => {
    render(<WalletConnectModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/Connect Stellar Wallet/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Freighter Wallet/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/xbull/i)).toBeInTheDocument();
    expect(screen.getByText(/albedo/i)).toBeInTheDocument();
  });
});
