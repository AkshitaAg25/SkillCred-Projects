
import React, { useState, useEffect } from 'react';
import { type Cause } from '../types';

interface CauseCardProps {
  cause: Cause;
  onDonateClick: (cause: Cause) => void;
}

const CauseCard: React.FC<CauseCardProps> = ({ cause, onDonateClick }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const targetProgress = (cause.raised / cause.goal) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(targetProgress), 300);
    return () => clearTimeout(timer);
  }, [targetProgress]);


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl h-full">
      <img src={cause.image} alt={cause.title} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-gray-800">{cause.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{cause.description}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${animatedProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>Raised: ${cause.raised.toLocaleString()}</span>
          <span>Goal: ${cause.goal.toLocaleString()}</span>
        </div>

        <button
          onClick={() => onDonateClick(cause)}
          className="mt-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Donate Now
        </button>
      </div>
    </div>
  );
};

export default CauseCard;