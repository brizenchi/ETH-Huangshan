import React from 'react';
import styles from './PlatformHeader.module.css';

const PlatformHeader = ({ onNewAgentClick, onConnectWallet, onDisconnectWallet, isConnected, address }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCreateAgent = () => {
    if (!isConnected) {
      onConnectWallet(); // Prompt to connect wallet first
    } else {
      onNewAgentClick();
    }
  };

  return (
    <header className={styles.heroHeader}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Welcome to the Archive</h1>
        <p className={styles.subtitle}>
          Forge, summon, and consult your own autonomous agents. <br />
          Your gateway to a decentralized AI collective.
        </p>
        <div className={styles.actionsContainer}>
          <button className={styles.createButton} onClick={handleCreateAgent}>
            <span>+</span> Create New Agent
          </button>
          {isConnected ? (
            <button className={styles.walletButton} onClick={onDisconnectWallet}>
              {formatAddress(address)}
            </button>
          ) : (
            <button className={styles.walletButton} onClick={onConnectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default PlatformHeader; 