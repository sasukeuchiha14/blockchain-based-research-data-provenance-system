import React, { useState, useEffect } from 'react';
import './index.css';

import { getContract } from './utils/web3';
import Login from './components/Login';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import HistorySection from './components/HistorySection';

function App() {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [globalHistory, setGlobalHistory] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    if (signer) {
      fetchGlobalHistory();
    }
  }, [signer]);

  const fetchGlobalHistory = async () => {
    try {
      const contract = getContract(signer);
      const count = await contract.datasetCount();
      const history = [];
      for (let i = Number(count); i >= 1; i--) {
        const data = await contract.getDataset(i);
        history.push({
          id: i,
          ipfsHash: data[0],
          researcher: data[1],
          timestamp: Number(data[2]) * 1000
        });
      }
      setGlobalHistory(history);
    } catch (error) {
      console.error("Error fetching global history:", error);
    }
  };

  const handleLogout = () => {
    setConnectedWallet(null);
    setSigner(null);
  };

  const handleUploadSuccess = () => {
    fetchGlobalHistory();
    setHighlightedId(null);
  };

  const handleVerifySuccess = (id) => {
    setHighlightedId(id);
  };

  if (!connectedWallet) {
    return <Login setConnectedWallet={setConnectedWallet} setSigner={setSigner} />;
  }

  return (
    <div className="max-w-[900px] mx-auto my-6 md:my-12 px-4 md:px-8 flex flex-col gap-8 w-full">
      <Header address={connectedWallet} onLogout={handleLogout} />
      <UploadSection 
        signer={signer} 
        onUploadSuccess={handleUploadSuccess} 
        onVerifySuccess={handleVerifySuccess}
        globalHistory={globalHistory} 
      />
      <HistorySection history={globalHistory} highlightedId={highlightedId} />
    </div>
  );
}

export default App;
