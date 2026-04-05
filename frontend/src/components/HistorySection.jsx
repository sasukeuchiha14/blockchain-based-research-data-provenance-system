import React from 'react';

const HistorySection = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="glass-panel">
      <h2>Recent Session Provenance</h2>
      <ul className="history-list">
        {history.map((item, idx) => (
          <li key={idx} className="history-item">
            <div>
              <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>IPFS CID</span>
              <br/>
              <a 
                href={`https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`} 
                target="_blank" 
                rel="noreferrer"
                className="hash-link"
              >
                {item.ipfsHash}
              </a>
            </div>
            <div>
              <span style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Transaction Hash</span>
              <br/>
              <span style={{fontFamily: 'monospace', fontSize:'0.9rem'}}>{item.txHash}</span>
            </div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'right'}}>
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistorySection;
