import React from 'react';
import styles from './AppHeader.module.css';

const AppHeader = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Explore The Archive</h1>
      <button className={styles.createButton}>Create Your Own Agent</button>
    </header>
  );
};

export default AppHeader; 