import React from 'react';
import styles from './AgentPlatform.module.css';
import AppHeader from '../components/AppHeader';
import AgentCard from '../components/AgentCard';

// 模拟数据
const mockAgents = [
  { name: 'Albert Einstein', bio: 'Physicist who developed the theory of relativity.', avatar: 'AE' },
  { name: 'Leonardo da Vinci', bio: 'High Renaissance artist, scientist, and inventor.', avatar: 'LV' },
  { name: 'Cleopatra', bio: 'The last active ruler of the Ptolemaic Kingdom of Egypt.', avatar: 'C' },
  { name: 'William Shakespeare', bio: 'England\'s national poet, the "Bard of Avon".', avatar: 'WS' },
  { name: 'Marie Curie', bio: 'Physicist and chemist who conducted pioneering research on radioactivity.', avatar: 'MC' },
  { name: 'Nikola Tesla', bio: 'Inventor, electrical engineer, and futurist.', avatar: 'NT' },
  { name: 'Sun Tzu', bio: 'Chinese general, strategist, and philosopher.', avatar: 'ST' },
  { name: 'Isaac Newton', bio: 'Mathematician, physicist, astronomer, and author.', avatar: 'IN' },
  { name: 'Joan of Arc', bio: 'Patron saint of France, honored as a defender of the French nation.', avatar: 'JA' },
];

const AgentPlatform = () => {
  return (
    <div className={styles.container}>
      <AppHeader />
      <main className={styles.agentList}>
        {mockAgents.map(agent => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </main>
    </div>
  );
};

export default AgentPlatform; 