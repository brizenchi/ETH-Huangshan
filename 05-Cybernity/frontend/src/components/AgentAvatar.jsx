import React from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styles from './AgentAvatar.module.css'; // Import the new CSS module

const AgentAvatar = ({ address, size, className }) => {
  // A simple fallback for invalid or missing addresses
  const a = address || '0x0000000000000000000000000000000000000000';
  
  // Combine the module class with any class passed as a prop
  const combinedClassName = `${styles.avatarContainer} ${className || ''}`.trim();

  return (
    <div 
      className={combinedClassName} 
      style={{ width: size, height: size }}
    >
      <Jazzicon diameter={size} seed={jsNumberForAddress(a)} />
    </div>
  );
};

export default AgentAvatar; 