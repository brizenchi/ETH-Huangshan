import React, { useState } from 'react';
import toast from 'react-hot-toast';
import styles from './TruncatedAddress.module.css';

// Simple SVG Copy Icon
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.copyIcon}
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const TruncatedAddress = ({ label, address, link }) => {
  const truncate = (str) => {
    if (!str) return '';
    // Handle Ethereum addresses
    if (str.startsWith('0x')) {
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
    }
    // Handle CIDs or other long strings
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>{label}:</span>
      <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {truncate(address)}
      </a>
      <button onClick={handleCopy} className={styles.copyButton} title="Copy to clipboard">
        <CopyIcon />
      </button>
    </div>
  );
};

export default TruncatedAddress; 