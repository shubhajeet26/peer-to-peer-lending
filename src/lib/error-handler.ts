export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export function parseStellarError(error: unknown): AppError {
  if (!error) {
    return { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' };
  }

  const errStr = String((error as Error)?.message || error);

  if (errStr.includes('User rejected') || errStr.includes('declined') || errStr.includes('User canceled')) {
    return {
      code: 'USER_REJECTED',
      message: 'Transaction signature was rejected by user',
    };
  }

  if (errStr.includes('Freighter') || errStr.includes('wallet not installed')) {
    return {
      code: 'WALLET_NOT_FOUND',
      message: 'Stellar wallet is not installed or detected in browser',
    };
  }

  if (errStr.includes('Network mismatch') || errStr.includes('wrong network')) {
    return {
      code: 'NETWORK_MISMATCH',
      message: 'Wallet is connected to a different Stellar network',
    };
  }

  if (errStr.includes('simulation failed') || errStr.includes('HostError')) {
    return {
      code: 'SIMULATION_FAILED',
      message: 'Transaction simulation failed. Smart contract rejected operation.',
      details: errStr,
    };
  }

  if (errStr.includes('tx_bad_seq') || errStr.includes('sequence number')) {
    return {
      code: 'BAD_SEQUENCE',
      message: 'Transaction sequence number mismatch. Please retry.',
    };
  }

  return {
    code: 'GENERIC_ERROR',
    message: (error as Error)?.message || 'An unexpected error occurred during execution.',
    details: error,
  };
}
