import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTypingEffect from '../hooks/useTypingEffect';
import styles from './StreamingAiBubble.module.css';

const StreamingAiBubble = ({ message, onAnimationEnd, scrollToBottom, IconAddressLink, CidIcon, TransactionIcon }) => {
  const [isFinished, setIsFinished] = useState(false);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    if (typeof onAnimationEnd === 'function') {
      onAnimationEnd(message.id);
    }
  }, [onAnimationEnd, message.id]);

  const displayedText = useTypingEffect(message.content, 25, handleFinish);

  useEffect(() => {
    if (typeof scrollToBottom === 'function') {
      scrollToBottom();
    }
  }, [displayedText, scrollToBottom]);

  return (
    <div className={`${styles.bubble} ${styles.aiBubble}`}>
      <div className={styles.markdownContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>
      </div>
      {isFinished && (
        <div className={styles.bubbleFooter}>
          <IconAddressLink 
            IconComponent={CidIcon} 
            address={message.cid} 
            link={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${message.cid}`} 
            title="Answer CID" 
          />
          {message.tx && (
            <IconAddressLink 
              IconComponent={TransactionIcon} 
              address={message.tx} 
              link={`https://sepolia.etherscan.io/tx/${message.tx}`} 
              title="Transaction" 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default StreamingAiBubble; 