import React, { createContext, useContext, useCallback } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleConnect = useCallback(() => {
    connect({ connector: injected() });
  }, [connect]);

  const value = {
    address,
    isConnected,
    connect: handleConnect,
    disconnect, // Expose the original disconnect function
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 