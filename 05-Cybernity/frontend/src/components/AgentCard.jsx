import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AgentCard.module.css';
import AgentAvatar from './AgentAvatar'; // Import the new component

const AgentCard = ({ agent }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Pass the full agent object to the chat page
    navigate(`/agent/${agent.cid}`, { state: { agent } });
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.mainContent}>
        <AgentAvatar address={agent.address} size={64} />
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