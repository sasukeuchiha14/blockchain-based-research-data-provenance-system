import React, { useRef, useState } from 'react';
import { getContract } from '../utils/web3';

const UploadSection = ({ signer, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus({ type: '', message: '' });
    }
  };

  const handleDropzoneClick = () => {
    if (!isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !signer) return;

    setIsUploading(true);
    setStatus({ type: 'info', message: 'Uploading securely to decentralized storage...' });

    try {
      // 1. Upload to pinata via backend
      const formData = new FormData();
      formData.append('dataset', selectedFile);

      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected the file.');
      }

      const ipfsHash = data.ipfsHash;
      setStatus({ type: 'info', message: `File secured on IPFS (${ipfsHash}). Please sign the transaction...` });

      // 2. Transact on Web3
      const contract = getContract(signer);
      const tx = await contract.addDataset(ipfsHash);

      setStatus({ type: 'info', message: `Transaction broadcasted (Tx: ${tx.hash.substring(0, 10)}...). Awaiting block confirmation.` });

      // 3. Wait for confirmation
      const receipt = await tx.wait();

      setStatus({ type: 'success', message: `Provenance verified! Secured in block ${receipt.blockNumber}.` });
      
      onUploadSuccess({
        ipfsHash,
        txHash: tx.hash,
        timestamp: new Date().toISOString()
      });

      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      if (error.code === 'ACTION_REJECTED') {
        setStatus({ type: 'error', message: 'Transaction rejected in MetaMask.' });
      } else {
        setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Secure a New Dataset</h2>
      
      <div 
        className={`file-dropzone ${selectedFile ? 'has-file' : ''}`}
        onClick={handleDropzoneClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .json, .txt, .pdf"
        />
        {selectedFile ? (
          <div>
            <svg style={{width:'40px', height:'40px', fill:'var(--accent)'}} viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <span className="file-name">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <div>
            <p>Click to select or drag and drop a dataset here</p>
            <p style={{fontSize: '0.8rem', marginTop:'0.5rem'}}>.CSV, .JSON, .TXT, .PDF (Max 10MB)</p>
          </div>
        )}
      </div>

      <button 
        className={`btn btn-primary ${isUploading ? 'animate-pulse' : ''}`} 
        onClick={handleSubmit} 
        disabled={!selectedFile || isUploading}
        style={{ width: '100%' }}
      >
        {isUploading ? 'Processing...' : 'Upload & Hash on Blockchain'}
      </button>

      {status.message && (
        <div className={`status-badge ${status.type === 'error' ? 'status-error' : status.type === 'info' ? 'info' : ''}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
