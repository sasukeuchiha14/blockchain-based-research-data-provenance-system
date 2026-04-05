import React from 'react';

const Header = ({ address, onLogout }) => {
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="glass-panel p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-50 mb-1 tracking-tight">Research Data Provenance</h1>
        <p className="text-sm text-slate-400">Secure, immutable audit trails for your datasets</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          {formatAddress(address)}
        </div>
        <button onClick={onLogout} className="btn btn-outline !py-2 !px-4 text-sm !w-auto">
          Disconnect
        </button>
      </div>
    </header>
  );
};

export default Header;
