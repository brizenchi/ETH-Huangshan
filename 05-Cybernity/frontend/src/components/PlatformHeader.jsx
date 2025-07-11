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
        <h1 className={styles.title}>思维画廊</h1>
        <p className={styles.subtitle}>
          在这里，每个智能体都是思维的回声，都是独特意识的展现。<br />
          塑造你的数字化自我，见证思想超越物理界限。
        </p>
        <div className={styles.actionsContainer}>
          <button className={styles.createButton} onClick={handleCreateAgent}>
            上传你的思维
          </button>
          {isConnected ? (
            <button className={styles.walletButton} onClick={onDisconnectWallet}>
              {formatAddress(address)}
            </button>
          ) : (
            <button className={styles.walletButton} onClick={onConnectWallet}>
              连接钱包
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default PlatformHeader; 