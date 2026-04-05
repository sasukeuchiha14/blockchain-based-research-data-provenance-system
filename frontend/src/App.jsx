import React, { useState } from 'react';
import './index.css';

import Login from './components/Login';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import HistorySection from './components/HistorySection';

function App() {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [datasetHistory, setDatasetHistory] = useState([]);

  const handleLogout = () => {
    setConnectedWallet(null);
    setSigner(null);
  };

  const handleUploadSuccess = (record) => {
    setDatasetHistory(prev => [record, ...prev]);
  };

  if (!connectedWallet) {
    return <Login setConnectedWallet={setConnectedWallet} setSigner={setSigner} />;
  }

  return (
    <div className="app-container">
      <Header address={connectedWallet} onLogout={handleLogout} />
      <UploadSection signer={signer} onUploadSuccess={handleUploadSuccess} />
      <HistorySection history={datasetHistory} />
    </div>
  );
}

export default App;
