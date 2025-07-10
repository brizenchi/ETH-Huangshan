import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useTypingEffect from '../hooks/useTypingEffect';
import styles from './StreamingAiBubble.module.css';

const StreamingAiBubble = ({ message, onAnimationEnd, scrollToBottom, IconAddressLink, CidIcon, TransactionIcon }) => {
  const [isFinished, setIsFinished] = useState(false);
  const [calculatedHeight, setCalculatedHeight] = useState(null);
  const ghostRef = useRef(null);

  useLayoutEffect(() => {
    if (ghostRef.current) {
      const height = ghostRef.current.offsetHeight;
      setCalculatedHeight(height);
    }
  }, []); // Run only once to calculate the final height

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    onAnimationEnd(message.id);
  }, [onAnimationEnd, message.id]);

  const displayedText = useTypingEffect(message.content, 25, handleFinish);

  useEffect(() => {
    scrollToBottom();
  }, [displayedText, scrollToBottom]);

  const bubbleStyle = {
    minHeight: calculatedHeight ? `${calculatedHeight}px` : '40px',
  };

  return (
    <>
      <div className={`${styles.bubble} ${styles.aiBubble}`} style={bubbleStyle}>
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

      {/* Render the ghost bubble only until the height is calculated */}
      {calculatedHeight === null && (
        <div ref={ghostRef} className={`${styles.bubble} ${styles.aiBubble} ${styles.ghost}`}>
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
          <div className={styles.bubbleFooter}>
            <IconAddressLink IconComponent={CidIcon} address={message.cid} link={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${message.cid}`} title="Answer CID" />
            {message.tx && <IconAddressLink IconComponent={TransactionIcon} address={message.tx} link={`https://sepolia.etherscan.io/tx/${message.tx}`} title="Transaction" />}
          </div>
        </div>
      )}
    </>
  );
};

export default StreamingAiBubble; 