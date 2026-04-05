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
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="glass-panel text-center max-w-sm w-full p-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 mb-2">Data Provenance</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">Authenticate via MetaMask to access the secure network.</p>
        
        <button 
          className={`btn btn-primary ${isConnecting ? 'animate-pulse' : ''}`}
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>

        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
