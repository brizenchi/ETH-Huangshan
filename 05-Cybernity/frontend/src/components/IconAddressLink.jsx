import React from 'react';
import toast from 'react-hot-toast';
import styles from './IconAddressLink.module.css';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const IconAddressLink = ({ IconComponent, address, link, title }) => {
  const truncate = (str) => {
    if (!str) return '';
    if (str.startsWith('0x')) {
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
    }
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(address);
    toast.success(`${title} copied to clipboard!`);
  };

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={styles.container} title={`View ${title} on explorer`}>
      <IconComponent />
      <span className={styles.address}>{truncate(address)}</span>
      <button onClick={handleCopy} className={styles.copyButton} title={`Copy ${title}`}>
        <CopyIcon />
      </button>
    </a>
  );
};

export default IconAddressLink; 