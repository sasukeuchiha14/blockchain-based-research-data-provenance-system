import React, { useRef, useState } from 'react';
import { getContract } from '../utils/web3';

const UploadSection = ({ signer, onUploadSuccess, globalHistory }) => {
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

  const handleVerify = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatus({ type: 'info', message: 'Verifying file against blockchain...' });

    try {
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
      const found = globalHistory?.find(d => d.ipfsHash === ipfsHash);

      if (found) {
         setStatus({ type: 'success', message: `Verified! Exact match found. This is Dataset #${found.id} secured by ${found.researcher.substring(0, 6)}...` });
      } else {
         setStatus({ type: 'error', message: `Verification Failed! This exact file hash (${ipfsHash}) does not exist on the blockchain.` });
      }
      setSelectedFile(null);
    } catch (error) {
       console.error(error);
       setStatus({ type: 'error', message: error.message || 'An unexpected error occurred.' });
    } finally {
       setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !signer) return;

    setIsUploading(true);
    setStatus({ type: 'info', message: 'Uploading securely to decentralized storage...' });

    try {
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

      const contract = getContract(signer);
      const tx = await contract.addDataset(ipfsHash);

      setStatus({ type: 'info', message: `Transaction broadcasted (Tx: ${tx.hash.substring(0, 10)}...). Awaiting block confirmation.` });

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
    <div className="glass-panel p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Secure a New Dataset</h2>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 mb-6 flex flex-col items-center justify-center ${selectedFile ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500 hover:bg-blue-500/5 bg-white/5'}`}
        onClick={handleDropzoneClick}
      >
        <input 
          className="hidden"
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .json, .txt, .pdf"
        />
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <svg className="w-10 h-10 fill-blue-500 mb-4" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <span className="font-semibold text-blue-500 block">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <div>
            <p className="text-slate-300">Click to select or drag and drop a dataset here</p>
            <p className="text-sm text-slate-500 mt-2">.CSV, .JSON, .TXT, .PDF (Max 10MB)</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <button 
          className={`btn btn-primary flex-1 ${isUploading ? 'animate-pulse' : ''}`} 
          onClick={handleSubmit} 
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Processing...' : 'Upload & Hash'}
        </button>
        <button 
          className="btn btn-outline flex-1" 
          onClick={handleVerify} 
          disabled={!selectedFile || isUploading}
        >
          Verify Existing File
        </button>
      </div>

      {status.message && (
        <div className={`status-badge ${status.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : status.type === 'info' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default UploadSection;
