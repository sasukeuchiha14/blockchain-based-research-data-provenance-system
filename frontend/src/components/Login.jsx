import React from 'react';
import { connectWallet } from '../utils/web3';

const Login = ({ setConnectedWallet, setSigner }) => {
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    try {
      const { account, signer } = await connectWallet();
      setConnectedWallet(account);
      setSigner(signer);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="glass-panel login-card">
        <h1>Data Provenance</h1>
        <p style={{ marginBottom: '2rem' }}>Authenticate via MetaMask to access the secure network.</p>
        
        <button 
          className={`btn btn-primary ${isConnecting ? 'animate-pulse' : ''}`}
          onClick={handleConnect}
          disabled={isConnecting}
          style={{ width: '100%' }}
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        {error && (
          <div style={{ marginTop: '1rem', color: 'var(--error)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
