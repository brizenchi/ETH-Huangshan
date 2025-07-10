import React from 'react';
import styles from './AppHeader.module.css';
import { useWallet } from './WalletProvider';

const AppHeader = ({ onNewAgentClick }) => {
  const { isConnected, connect, disconnect, address } = useWallet();

  const handleCreateAgent = () => {
    if (!isConnected) {
      connect();
    } else {
      onNewAgentClick();
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Explore The Archive</h1>
      <div className={styles.actionsContainer}>
        <button className={styles.createButton} onClick={handleCreateAgent}>
          Create Your Own Agent
        </button>
        {isConnected ? (
          <button className={styles.walletButton} onClick={disconnect}>
            {formatAddress(address)}
          </button>
        ) : (
          <button className={styles.walletButton} onClick={connect}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader; 