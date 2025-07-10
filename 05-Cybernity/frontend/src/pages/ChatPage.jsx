import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ChatPage.module.css';
import { useWallet } from '../components/WalletProvider';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import toast from 'react-hot-toast';

const contractAddress = '0x6AB14941378f8D6D1968e9767dfEE630e74F360f';
const contractAbi = [{
  "name": "askQuestion",
  "type": "function",
  "stateMutability": "payable",
  "inputs": [
    { "type": "string", "name": "_cid" },
    { "type": "string", "name": "_questionContent" }
  ],
  "outputs": []
}];

const ChatPage = () => {
  const { cid } = useParams();
  const { address: userAddress } = useWallet();
  const [agent, setAgent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null); // Ref for the polling interval
  const submittedQuestionRef = useRef(''); // Ref to store the submitted question

  const { data: hash, writeContract, isPending, error: contractError } = useWriteContract();

  const fetchAgentDetails = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/agent/detail?cid=${cid}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const result = await response.json();
      if (result.code === 200 && result.data) {
        setAgent(result.data);
        const fetchedQuestions = result.data.questions || [];
        setQuestions(fetchedQuestions);
        // If there's no active question or the active one is no longer in the list, set a new one.
        if (fetchedQuestions.length > 0 && (!activeQuestion || !fetchedQuestions.find(q => q.id === activeQuestion.id))) {
          setActiveQuestion(fetchedQuestions[0]);
        }
      } else {
        throw new Error(result.message || 'Failed to load agent details.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cid, activeQuestion]);

  useEffect(() => {
    fetchAgentDetails();
  }, [cid]); // Initial fetch

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !userAddress) {
      toast.error("Please connect your wallet and enter a question.");
      return;
    }
    
    submittedQuestionRef.current = newQuestion; // Store the question in the ref

    writeContract({
      address: contractAddress,
      abi: contractAbi,
      functionName: 'askQuestion',
      args: [cid, newQuestion],
      value: 1000000000000n,
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isPending) {
      toast.loading('Sending transaction... Please check your wallet.', { id: 'ask' });
      return;
    }
    if (isConfirming) {
      toast.loading('Waiting for transaction confirmation...', { id: 'ask' });
      return;
    }
    if (contractError) {
      toast.error(contractError.shortMessage || "Transaction failed.", { id: 'ask' });
      return;
    }

    if (isConfirmed) {
      toast.success('Transaction confirmed! Polling for backend update...', { id: 'ask' });
      setNewQuestion('');

      const expectedQuestion = submittedQuestionRef.current;
      const pollStartTime = Date.now();
      const POLLING_INTERVAL = 2000; // 2 seconds
      const POLLING_TIMEOUT = 60000; // 60 seconds

      pollingRef.current = setInterval(async () => {
        try {
          if (Date.now() - pollStartTime > POLLING_TIMEOUT) {
            clearInterval(pollingRef.current);
            toast.error('Polling timed out. Please refresh manually.', { id: 'ask' });
            return;
          }

          const response = await fetch(`/api/v1/agent/detail?cid=${cid}`);
          const result = await response.json();

          if (result.code === 200 && result.data && result.data.questions) {
            const updatedQuestions = result.data.questions;
            const isUpdated = updatedQuestions.some(q => q.question === expectedQuestion);

            if (isUpdated) {
              clearInterval(pollingRef.current);
              setAgent(result.data);
              setQuestions(updatedQuestions);
              setActiveQuestion(updatedQuestions.find(q => q.question === expectedQuestion) || updatedQuestions[0]);
              toast.success('Agent updated successfully!', { id: 'ask' });
            }
          }
        } catch (err) {
          console.error("Polling error:", err);
          clearInterval(pollingRef.current);
          toast.error('Failed to fetch updates.', { id: 'ask' });
        }
      }, POLLING_INTERVAL);
    }
    
    // Cleanup polling on component unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isPending, isConfirming, isConfirmed, contractError, cid]);

  if (loading) return <div className={styles.container}><p>Loading agent...</p></div>;
  if (error) return <div className={styles.container}><p>Error: {error}</p></div>;
  if (!agent) return <div className={styles.container}><p>Agent not found.</p></div>;
  
  const isSubmitting = isPending || isConfirming;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/app" className={styles.backButton}>&larr; Back to Agents</Link>
        <div className={styles.agentInfo}>
          <div className={styles.agentDetails}>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
          </div>
          <div className={styles.agentMeta}>
            <p>
              Agent CID:{" "}
              <a href={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                {cid}
              </a>
            </p>
            <p>Agent Address: {agent.agent_address}</p>
          </div>
        </div>
      </div>
      
      <div className={styles.chatContainer}>
        <div className={styles.tabs}>
          {questions.map((q) => (
            <button 
              key={q.id}
              className={`${styles.tab} ${activeQuestion?.id === q.id ? styles.active : ''}`}
              onClick={() => setActiveQuestion(q)}
            >
              {q.question}
            </button>
          ))}
        </div>
        
        <div className={styles.chatContent}>
          {activeQuestion ? (
            <div className={styles.chatItem}>
              <p className={styles.question}>Q: {activeQuestion.question}</p>
              <div className={styles.answer}>
                <span className={styles.answerLabel}>A:</span>
                <div className={styles.markdownContent}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeQuestion.answer}
                  </ReactMarkdown>
                </div>
              </div>
              <div className={styles.metadata}>
                <span>
                  Answer CID:{" "}
                  <a href={`https://amethyst-tragic-marlin-192.mypinata.cloud/ipfs/${activeQuestion.answer_cid}`} target="_blank" rel="noopener noreferrer">
                    {activeQuestion.answer_cid}
                  </a>
                </span>
                {activeQuestion.transaction_hash && (
                  <span>
                    Transaction:{" "}
                    <a href={`https://sepolia.etherscan.io/tx/${activeQuestion.transaction_hash}`} target="_blank" rel="noopener noreferrer">
                      {activeQuestion.transaction_hash}
                    </a>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p>No questions have been answered yet. Ask the first one!</p>
          )}
        </div>
      </div>

      <form onSubmit={handleQuestionSubmit} className={styles.questionForm}>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a new question..."
          className={styles.questionInput}
          disabled={isSubmitting}
        />
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage; 