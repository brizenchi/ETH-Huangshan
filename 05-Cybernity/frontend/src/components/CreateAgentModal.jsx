import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from './WalletProvider';
import toast from 'react-hot-toast';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import styles from './CreateAgentModal.module.css';

const contractAddress = '0x6AB14941378f8D6D1968e9767dfEE630e74F360f';
const contractAbi = [
  {
    "name": "registerAgent",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "type": "string", "name": "_cid" },
      { "type": "address", "name": "_operator" },
      { "type": "string", "name": "_name" },
      { "type": "string", "name": "_description" },
      { "type": "uint256", "name": "_price" }
    ],
    "outputs": []
  }
];

const CreateAgentModal = ({ isOpen, onClose, onAgentCreated }) => {
  const { address } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState(null);
  const isFinalizing = useRef(false); // Ref to prevent re-entry
  const toastIdRef = useRef(null); // Ref to hold the single toast ID

  const { data: hash, writeContract, isPending, error: contractError } = useWriteContract();

  useEffect(() => {
    if (hash && toastIdRef.current) {
      console.log('Transaction sent. Hash:', hash);
      toast.loading('Waiting for transaction confirmation...', { id: toastIdRef.current });
    }
  }, [hash]);

  useEffect(() => {
    // This effect runs when the modal is first opened or dependencies change.
    // We reset the finalization flag if the modal is closed and reopened.
    if (!isOpen) {
      isFinalizing.current = false;
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [isOpen]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!name || !description || !file || !address) {
      setError('Please fill out all fields and ensure your wallet is connected.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    toastIdRef.current = toast.loading('Step 1/3: Uploading to IPFS...');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('creator_address', address);

    try {
      const response = await fetch('/api/v1/agent/generate', { method: 'POST', body: formData });
      const result = await response.json();

      if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Failed to create agent profile.');
      }
      
      toast.loading('Step 2/3: Registering CID on-chain. Please confirm in wallet.', { id: toastIdRef.current });
      setApiData(result.data);

      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'registerAgent',
        args: [
          result.data.cid,
          result.data.agent_address,
          result.data.name,
          result.data.description,
          1000000000000n // Hardcoded 10^12 wei as BigInt
        ],
      });
      
    } catch (err) {
      console.error('Off-chain creation failed:', err);
      setError(err.message);
      if (toastIdRef.current) {
        toast.error(err.message, { id: toastIdRef.current });
      }
      setIsSubmitting(false);
    }
  }, [name, description, file, address, writeContract]);
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (contractError && toastIdRef.current) {
      toast.error(contractError.shortMessage || 'Contract call failed.', { id: toastIdRef.current });
      setIsSubmitting(false);
      return;
    }

    if (isConfirmed && apiData && !isFinalizing.current) {
      isFinalizing.current = true; // Set the flag immediately
      const finalizeRegistration = async () => {
        if (toastIdRef.current) {
          toast.loading('Step 3/3: Finalizing registration with backend...', { id: toastIdRef.current });
        }
        try {
          const response = await fetch(`/api/v1/agent/on_chain?cid=${apiData.cid}`, {
            method: 'PUT',
          });
          const result = await response.json();
          if (!response.ok || result.code !== 200) {
            throw new Error(result.message || 'Backend finalization failed.');
          }
          if (toastIdRef.current) {
            toast.success('Agent fully created and registered!', { id: toastIdRef.current });
          }
          onAgentCreated(apiData);
        } catch (err) {
          console.error('Finalization failed:', err);
          if (toastIdRef.current) {
            toast.error(`Finalization failed: ${err.message}`, { id: toastIdRef.current });
          }
        } finally {
          setIsSubmitting(false);
        }
      };

      finalizeRegistration();
    }
  }, [isConfirmed, contractError, apiData, onAgentCreated]);

  if (!isOpen) return null;

  const getButtonText = () => {
    if (isPending) return 'Check Wallet...';
    if (isConfirming) return 'Confirming...';
    return 'Create Agent';
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create Your Digital Twin</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="file">Knowledge Base (text file)</label>
            <input type="file" id="file" accept=".txt" onChange={handleFileChange} required />
          </div>
          <div className={styles.formGroup}>
            <label>Creator Address</label>
            <input type="text" value={address || 'Wallet not connected'} disabled />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || isPending || isConfirming} className={styles.submitButton}>
              {isSubmitting || isPending || isConfirming ? (
                <>
                  <div className={styles.spinner}></div>
                  {getButtonText()}
                </>
              ) : (
                'Create Agent'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgentModal; 