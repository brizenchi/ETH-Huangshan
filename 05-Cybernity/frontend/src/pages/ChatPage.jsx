import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ChatPage.module.css';
import { useWallet } from '../components/WalletProvider';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import IconAddressLink from '../components/IconAddressLink';
import AgentAvatar from '../components/AgentAvatar';
import StagedProgressBar from '../components/StagedProgressBar';
import StreamingAiBubble from '../components/StreamingAiBubble'; // New import

// Icon Components
const CidIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const TransactionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
);
// New icon for Agent Address
const AddressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const PROGRESS_STAGES = ['sending', 'confirming', 'polling', 'generating'];
const STAGE_MESSAGES = {
  sending: '正在发送交易...',
  confirming: '正在等待链上确认...',
  polling: '正在后台检索...',
  generating: 'AI 正在生成回复...',
};

const contractAddress = '0x6AB14941378f8D6D1968e9767dfEE630e74F360f';
const contractAbi = [{"name": "askQuestion", "type": "function", "stateMutability": "payable", "inputs": [{ "type": "string", "name": "_cid" }, { "type": "string", "name": "_questionContent" }], "outputs": []}];

const ChatPage = () => {
  const { cid } = useParams();
  const { address: userAddress } = useWallet();
  const [agent, setAgent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);
  const pollingStartedRef = useRef(false);
  const optimisticQuestionIdRef = useRef(null);
  const lastSubmittedQuestion = useRef('');
  const chatContentRef = useRef(null);

  const { data: hash, writeContract, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmationError } = useWaitForTransactionReceipt({ hash });

  const updateLoadingQuestion = useCallback((updates) => {
    const loadingId = optimisticQuestionIdRef.current;
    if (!loadingId) return;
    setQuestions(prev =>
      prev.map(q => (q.id === loadingId ? { ...q, ...updates } : q))
    );
  }, []); // Empty dependency array makes this function stable

  const scrollToBottom = useCallback(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTo({
        top: chatContentRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleAnimationEnd = useCallback((questionId) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, isNew: false } : q))
    );
  }, []);

  const fetchAgentDetails = useCallback(async () => {
    // ... logic to fetch and set questions, setting the first as active
    try {
      const response = await fetch(`/api/v1/agent/detail?cid=${cid}`);
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setAgent(result.data);
        const fetchedQuestions = (result.data.questions || []).reverse().map(q => ({...q, status: 'complete'}));
        setQuestions(fetchedQuestions);
        if (fetchedQuestions.length > 0) {
          setActiveQuestion(fetchedQuestions[0]);
        }
      } else { throw new Error(result.message); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [cid]);

  useEffect(() => {
    fetchAgentDetails();
  }, [fetchAgentDetails]);

  // Ensure activeQuestion is always valid
  useEffect(() => {
    if (questions.length > 0) {
      const activeExists = questions.some(q => q.id === activeQuestion?.id);
      if (!activeExists) {
        setActiveQuestion(questions[0]);
      }
    } else {
      setActiveQuestion(null);
    }
  }, [questions, activeQuestion]);


  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !userAddress || isPending || isConfirming) return;

    lastSubmittedQuestion.current = newQuestion;
    const optimisticQuestion = {
      id: uuidv4(),
      question: newQuestion,
      answer: '',
      status: 'loading',
      progressStage: 'sending',
      isNew: false,
    };
    
    optimisticQuestionIdRef.current = optimisticQuestion.id;
    pollingStartedRef.current = false; // Reset for new submission

    setQuestions(prev => [optimisticQuestion, ...prev]);
    setActiveQuestion(optimisticQuestion);
    setNewQuestion('');

    writeContract({ address: contractAddress, abi: contractAbi, functionName: 'askQuestion', args: [cid, newQuestion], value: 1000000000000n });
  };

  const pollingTask = useCallback(async () => {
    try {
        const response = await fetch(`/api/v1/agent/detail?cid=${cid}`);
        const result = await response.json();
        if (result.code === 200 && result.data) {
            const remoteQuestions = (result.data.questions || []).reverse();
            const newRemoteQuestion = remoteQuestions.find(q => q.question === lastSubmittedQuestion.current);
            if (newRemoteQuestion) {
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
                toast.success('AI 回复已收到！', { id: 'ask' });
                const updatedQuestion = {
                    ...newRemoteQuestion,
                    status: 'complete',
                    isNew: true,
                };
                const loadingId = optimisticQuestionIdRef.current;
                setQuestions(prev => prev.map(q => q.id === loadingId ? updatedQuestion : q));
                setActiveQuestion(updatedQuestion);
                reset();
            }
        }
    } catch (err) {
        console.error("Polling failed:", err);
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        toast.error("Failed to retrieve AI response.", { id: 'ask' });
        const loadingId = optimisticQuestionIdRef.current;
        setQuestions(prev => prev.filter(q => q.id !== loadingId));
    }
  }, [cid, reset]);


  useEffect(() => {
    if (isPending) {
      updateLoadingQuestion({ progressStage: 'sending' });
      return;
    }
    if (isConfirming) {
      updateLoadingQuestion({ progressStage: 'confirming' });
      return;
    }
    if (confirmationError) {
      toast.error(confirmationError.shortMessage || "Transaction failed.", { id: 'ask' });
      const loadingId = optimisticQuestionIdRef.current;
      setQuestions(prev => prev.filter(q => q.id !== loadingId));
      reset();
      return;
    }
    if (isConfirmed && !pollingStartedRef.current) {
      pollingStartedRef.current = true;
      updateLoadingQuestion({ progressStage: 'polling' });
      const timeoutId = setTimeout(() => updateLoadingQuestion({ progressStage: 'generating' }), 4000);
      
      pollingTask(); // Poll immediately once for faster response
      pollingRef.current = setInterval(pollingTask, 3000);

      return () => {
        clearTimeout(timeoutId);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [isPending, isConfirming, isConfirmed, confirmationError, reset, updateLoadingQuestion, pollingTask]);


  if (loading) return <div className={styles.container}><p>Loading agent...</p></div>;
  if (error) return <div className={styles.container}><p>Error: {error}</p></div>;
  if (!agent) return <div className={styles.container}><p>Agent not found.</p></div>;
  
  const isSubmitting = isPending || isConfirming;

  return (
    <div className={styles.container}>
      {/* Header remains the same */}
      <div className={styles.header}>
        <Link to="/app" className={styles.backButton}>&larr; Back to Agents</Link>
        <div className={styles.agentInfo}>
          <AgentAvatar 
            address={agent.agent_address} 
            size={80} 
            className={styles.avatarContainer} 
          />
          <div className={styles.agentDetails}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
          <div className={styles.agentMeta}>
            <IconAddressLink IconComponent={CidIcon} address={cid} link={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${cid}`} title="Agent CID" />
            <IconAddressLink IconComponent={AddressIcon} address={agent.agent_address} link={`https://sepolia.etherscan.io/address/${agent.agent_address}`} title="Agent Address" />
          </div>
        </div>
      </div>
      
      <div className={styles.chatLayout}>
        <div className={styles.questionList}>
          {questions.map(q => (
            <button 
              key={q.id}
              className={`${styles.tab} ${activeQuestion?.id === q.id ? styles.active : ''} ${q.status === 'loading' ? styles.loading : ''}`}
              onClick={() => setActiveQuestion(q)}
            >
              {q.question}
            </button>
          ))}
        </div>
        <div className={styles.chatContainer}>
        <div className={styles.chatContent} ref={chatContentRef}>
            {activeQuestion && (
              <>
                <div className={`${styles.bubble} ${styles.userBubble}`}>{activeQuestion.question}</div>
                
                {activeQuestion.status === 'loading' && (
                  <div className={`${styles.bubble} ${styles.aiBubble}`}>
                    <StagedProgressBar stages={PROGRESS_STAGES} currentStage={activeQuestion.progressStage} stageMessages={STAGE_MESSAGES} />
                  </div>
                )}

                {activeQuestion.status === 'complete' && activeQuestion.isNew && (
                  <StreamingAiBubble 
                    message={{
                      ...activeQuestion, 
                      content: activeQuestion.answer, 
                      cid: activeQuestion.answer_cid, 
                      tx: activeQuestion.transaction_hash
                    }} 
                    onAnimationEnd={handleAnimationEnd} 
                    scrollToBottom={scrollToBottom} 
                    IconAddressLink={IconAddressLink} 
                    CidIcon={CidIcon} 
                    TransactionIcon={TransactionIcon} 
                  />
                )}

                {activeQuestion.status === 'complete' && !activeQuestion.isNew && (
                  <div className={`${styles.bubble} ${styles.aiBubble}`}>
                    <div className={styles.markdownContent}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeQuestion.answer}</ReactMarkdown>
                    </div>
                    <div className={styles.bubbleFooter}>
                       <IconAddressLink 
                         IconComponent={CidIcon} 
                         address={activeQuestion.answer_cid} 
                         link={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${activeQuestion.answer_cid}`} 
                         title="Answer CID" 
                       />
                       {activeQuestion.transaction_hash && (
                         <IconAddressLink 
                           IconComponent={TransactionIcon} 
                           address={activeQuestion.transaction_hash} 
                           link={`https://sepolia.etherscan.io/tx/${activeQuestion.transaction_hash}`} 
                           title="Transaction" 
                         />
                )}
              </div>
            </div>
                )}
              </>
          )}
          </div>
        </div>
      </div>

      <form onSubmit={handleQuestionSubmit} className={styles.questionForm}>
        <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Ask a new question..." className={styles.questionInput} disabled={isSubmitting} />
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage; 