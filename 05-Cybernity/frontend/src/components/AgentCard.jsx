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
    <div className={styles.card}>
      <div className={styles.mainContent} onClick={handleCardClick}>
        <AgentAvatar address={agent.address} size={64} />
        <div className={styles.textWrapper}>
          <h3 className={styles.name}>{agent.name}</h3>
          <p className={styles.bio}>{agent.bio}</p>
        </div>
      </div>
      <button className={styles.consultButton} onClick={handleCardClick}>
        Consult
      </button>
    </div>
  );
};

export default AgentCard; 