import React from 'react';
import styles from './StagedProgressBar.module.css';

const LoaderIcon = () => (
  <svg className={styles.spinner} viewBox="0 0 50 50">
    <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);

const StagedProgressBar = ({ stages, currentStage, stageMessages }) => {
  const currentStageIndex = stages.indexOf(currentStage);

  return (
    <div className={styles.container}>
      <div className={styles.stages}>
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isActive = index === currentStageIndex;
          
          return (
            <React.Fragment key={stage}>
              <div
                className={`
                  ${styles.stage}
                  ${isCompleted ? styles.completed : ''}
                  ${isActive ? styles.active : ''}
                `}
              >
                <div className={styles.dot}></div>
              </div>
              {index < stages.length - 1 && <div className={`${styles.line} ${isCompleted ? styles.completed : ''}`}></div>}
            </React.Fragment>
          );
        })}
      </div>
      <div className={styles.statusContainer}>
        <LoaderIcon />
        <p className={styles.statusMessage}>{stageMessages[currentStage] || '处理中...'}</p>
      </div>
    </div>
  );
};

export default StagedProgressBar; 