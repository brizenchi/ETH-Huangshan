import React from 'react';
import styles from './AgentCard.module.css';

const AgentCard = ({ agent }) => {
  return (
    <div className={styles.card}>
      {/* 1. 信息区域 (上部) */}
      <div className={styles.mainContent}>
        {/* 1a. 头像 (左侧) */}
        <div className={styles.avatar}>
          <span>{agent.avatar}</span>
        </div>
        {/* 1b. 姓名、简介 (右侧) */}
        <div className={styles.textWrapper}>
          <h3 className={styles.name}>{agent.name}</h3>
          <p className={styles.bio}>{agent.bio}</p>
        </div>
      </div>
      
      {/* 2. 按钮 (底部) */}
      <div className={styles.consultFooter}>
        <span>Consult</span>
      </div>
    </div>
  );
};

export default AgentCard; 