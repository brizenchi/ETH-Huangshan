import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from './WalletProvider';
import styles from './CreateAgentModal.module.css';
import DigitalHelix from './DigitalHelix';
import toast from 'react-hot-toast';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

// Contract details
const contractAddress = '0x6AB14941378f8D6D1968e9767dfEE630e74F360f';
const contractAbi = [{"name":"registerAgent","type":"function","stateMutability":"nonpayable","inputs":[{"type":"string","name":"_cid"},{"type":"address","name":"_operator"},{"type":"string","name":"_name"},{"type":"string","name":"_description"},{"type":"uint256","name":"_price"}],"outputs":[]}];

// Icons (placeholders, assuming they are defined as before)
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const UploadCloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.9,15.1l-5.6-5.6c-0.4-0.4-1-0.4-1.4,0l-5.6,5.6c-0.4,0.4-0.4,1,0,1.4l0,0c0.4,0.4,1,0.4,1.4,0l4.9-4.9l4.9,4.9c0.4,0.4,1,0.4,1.4,0l0,0C19.3,16.1,19.3,15.5,18.9,15.1z"/></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const CreateAgentModal = ({ isOpen, onClose, onAgentCreated }) => {
  const { address } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [apiData, setApiData] = useState(null);
  const isFinalizing = useRef(false);
  const toastIdRef = useRef(null);
  
  const { data: hash, writeContract, isPending, error: contractError } = useWriteContract();

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setFile(null);
      setError('');
      setIsSubmitting(false);
      setApiData(null);
      isFinalizing.current = false;
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, [isOpen]);

  // File handling logic
  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/plain') {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size cannot exceed 5MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid .txt file.');
    }
  };
  
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  // Step 1: Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !file || !address) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    toastIdRef.current = toast.loading('Step 1/3: Uploading knowledge base...');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('creator_address', address);

    try {
      const response = await fetch('/api/v1/agent/generate', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Failed to create agent profile.');
      }
      
      // Step 2: Trigger on-chain transaction
      toast.loading('Step 2/3: Awaiting wallet confirmation...', { id: toastIdRef.current });
      setApiData(result.data); // Save data for the next step
      writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'registerAgent',
        args: [
          result.data.cid,
          result.data.agent_address,
          result.data.name,
          result.data.description,
          // Hardcoded price as BigInt
          1000000000000n 
        ],
      });

    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: toastIdRef.current });
      setIsSubmitting(false);
    }
  };

  // Listen for wallet submission error
  useEffect(() => {
    if (contractError) {
      toast.error(contractError.shortMessage || 'Wallet transaction failed.', { id: toastIdRef.current });
      setIsSubmitting(false);
      setApiData(null);
    }
  }, [contractError]);

  // Listen for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Step 3: Finalize with backend after confirmation
  useEffect(() => {
    if (isConfirmed && apiData && !isFinalizing.current) {
      isFinalizing.current = true;
      
      const finalizeRegistration = async () => {
        toast.loading('Step 3/3: Finalizing registration...', { id: toastIdRef.current });
        try {
          const response = await fetch(`/api/v1/agent/on_chain?cid=${apiData.cid}`, {
            method: 'PUT',
          });
          const result = await response.json();
          if (!response.ok || result.code !== 200) {
            throw new Error(result.message || 'Backend finalization failed.');
          }
          toast.success('Agent created successfully!', { id: toastIdRef.current });
          onAgentCreated(apiData);
        } catch (err) {
          toast.error(`Finalization failed: ${err.message}`, { id: toastIdRef.current });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      finalizeRegistration();
    }
  }, [isConfirmed, apiData, onAgentCreated]);


  if (!isOpen) return null;

  const getButtonText = () => {
    if (isPending) return 'Check Wallet...';
    if (isConfirming) return 'Confirming Tx...';
    if (isSubmitting) return 'Processing...';
    return 'Create Agent';
  };
  
  const isBusy = isSubmitting || isPending || isConfirming;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.leftPanel}>
          <DigitalHelix />
          <h3>铸造您的数字分身</h3>
          <p>上传您的知识库，我们将为您孕育一个继承您思想的 AI 代理，并将其永久记录在去中心化网络中。</p>
        </div>
        <div className={styles.rightPanel}>
          <button className={styles.closeButton} onClick={onClose} disabled={isBusy}>
            <XIcon />
          </button>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.title}>Create Your Digital Twin</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="name">Name</label>
              <div className={styles.inputWrapper}>
                <UserIcon />
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Isaac Asimov" required disabled={isBusy} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Description</label>
              <div className={styles.inputWrapper}>
                <FileTextIcon />
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. A science fiction writer and professor of biochemistry." rows="3" disabled={isBusy} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="file">Knowledge Base (.txt)</label>
              <div 
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isBusy ? styles.disabled : ''}`}
                onDragEnter={isBusy ? null : handleDragEnter}
                onDragLeave={isBusy ? null : handleDragLeave}
                onDragOver={isBusy ? null : handleDragOver}
                onDrop={isBusy ? null : handleDrop}
                onClick={isBusy ? null : () => fileInputRef.current.click()}
              >
                <input 
                    type="file" 
                    id="file"
                    ref={fileInputRef} 
                    onChange={(e) => handleFileSelect(e.target.files[0])} 
                    accept=".txt" 
                    hidden 
                    disabled={isBusy}
                />
                {file ? (
                  <div className={styles.fileInfo}>
                    <span>{file.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} disabled={isBusy}>
                        <XIcon />
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadPrompt}>
                    <UploadCloudIcon />
                    <p>
                      <strong>Click to upload</strong> or drag and drop.
                    </p>
                    <span>(Max file size 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.inputGroup}>
                <label>Creator Address</label>
                <div className={styles.addressDisplay}>{address || 'Please connect your wallet'}</div>
            </div>
            
            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.buttonGroup}>
              <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isBusy}>
                Cancel
              </button>
              <button type="submit" className={styles.submitButton} disabled={isBusy || !address}>
                {isBusy ? (
                  <>
                    <div className={styles.spinner}></div>
                    {getButtonText()}
                  </>
                ) : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAgentModal; 