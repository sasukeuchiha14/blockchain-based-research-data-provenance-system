import React from 'react';

const Header = ({ address, onLogout }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 0 }}>Research Data Provenance</h1>
        <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Secure, immutable audit trails for your datasets</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.9rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
          {formatAddress(address)}
        </div>
        <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Disconnect
        </button>
      </div>
    </header>
  );
};

export default Header;
