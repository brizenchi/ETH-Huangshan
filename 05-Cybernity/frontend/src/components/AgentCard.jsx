import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AgentCard.module.css';

const AgentCard = ({ agent }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/agent/${agent.cid}`);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.mainContent}>
        <div className={styles.avatar}>
          <span>{agent.avatar}</span>
        </div>
        <div className={styles.textWrapper}>
          <h3 className={styles.name}>{agent.name}</h3>
          <p className={styles.bio}>{agent.bio}</p>
        </div>
      </div>
      <div className={styles.consultFooter}>
        <span>Consult</span>
      </div>
    </div>
  );
};

export default AgentCard; 