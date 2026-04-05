import React, { useEffect, useRef } from 'react';

const HistorySection = ({ history, highlightedId }) => {
  const itemRefs = useRef({});

  useEffect(() => {
    if (highlightedId && itemRefs.current[highlightedId]) {
      itemRefs.current[highlightedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  if (!history || history.length === 0) return null;

  return (
    <div className="glass-panel p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Global Blockchain History</h2>
      <ul className="flex flex-col gap-4">
        {history.map((item, idx) => (
          <li 
            key={idx} 
            ref={el => itemRefs.current[item.id] = el}
            className={`p-4 md:p-6 rounded-lg flex flex-col gap-2 transition-all duration-700 ${highlightedId === item.id ? 'bg-emerald-500/20 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-black/20 border border-white/10'}`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-slate-400 text-sm">Dataset ID #{item.id}</span>
              <span className="font-mono text-sm md:text-base text-blue-400 break-all">
                {item.ipfsHash}
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-slate-400 text-sm">Secured By Researcher</span>
              <span className="font-mono text-sm break-all">{item.researcher}</span>
            </div>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 pt-4 border-t border-white/5 gap-4">
              <div className="text-slate-400 text-xs md:text-sm">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <a 
                href={`https://gateway.pinata.cloud/ipfs/${item.ipfsHash}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-outline !py-2 !px-4 text-xs md:text-sm text-center"
              >
                Download Original File
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistorySection;
