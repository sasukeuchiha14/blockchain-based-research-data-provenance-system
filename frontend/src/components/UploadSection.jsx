import React, { useRef, useState } from 'react';
import { getContract } from '../utils/web3';

const UploadSection = ({ signer, onUploadSuccess, onVerifySuccess, globalHistory }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [mode, setMode] = useState('verify'); // 'verify' or 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setStatus({ type: '', message: '' });
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
         onVerifySuccess(found.id);
      } else {
         setStatus({ type: 'error', message: `Verification Failed! This exact file hash (${ipfsHash}) does not exist on the blockchain.` });
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
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
      const finalName = datasetName.trim() === '' ? selectedFile.name : datasetName.trim();
      formData.append('datasetName', finalName);

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
      const tx = await contract.addDataset(ipfsHash, finalName);

      setStatus({ type: 'info', message: `Transaction broadcasted (Tx: ${tx.hash.substring(0, 10)}...). Awaiting block confirmation.` });

      const receipt = await tx.wait();

      setStatus({ 
        type: 'success', 
        message: (
          <span>
            Provenance verified! Secured in block {receipt.blockNumber}..{' '}
            <a href={`https://sepolia.etherscan.io/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="underline font-bold hover:opacity-80">
              View on Etherscan
            </a>
          </span>
        )
      });
      
      onUploadSuccess({
        ipfsHash,
        txHash: tx.hash,
        timestamp: new Date().toISOString()
      });

      setSelectedFile(null);
      setDatasetName('');
      if (fileInputRef.current) fileInputRef.current.value = null;
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
      
      <div className="flex bg-black/40 p-1 rounded-xl mb-6">
        <button
          onClick={() => setMode('verify')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'verify' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Verify Existing File
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'upload' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Upload & Hash (New Track)
        </button>
      </div>

      <div 
        className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all duration-200 mb-6 flex flex-col items-center justify-center ${
          isDragOver || selectedFile ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-blue-500 hover:bg-blue-500/5 bg-white/5'
        }`}
        onClick={handleDropzoneClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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

      {mode === 'upload' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Dataset Name (Optional but Recommended)</label>
          <input 
            type="text" 
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Ex: Dataset Name v0"
            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-slate-50 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
          />
        </div>
      )}

      <div className="flex w-full mt-2">
        {mode === 'upload' ? (
          <button 
            className={`btn btn-primary w-full ${isUploading ? 'animate-pulse' : ''}`} 
            onClick={handleSubmit} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Processing...' : 'Secure & Hash Dataset'}
          </button>
        ) : (
          <button 
            className={`btn btn-outline w-full ${isUploading ? 'animate-pulse' : ''}`} 
            onClick={handleVerify} 
            disabled={!selectedFile || isUploading}
          >
             {isUploading ? 'Scanning Chain...' : 'Verify Existing File'}
          </button>
        )}
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
