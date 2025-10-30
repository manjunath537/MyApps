
import React, { useState, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface LoadingIndicatorProps {
  progressMessage: string;
}

const loadingMessages = [
    "Sketching the blueprints...",
    "Pouring the foundation...",
    "Raising the framework...",
    "Choosing the color palette...",
    "Furnishing the interior...",
    "Landscaping the garden...",
    "Adding the final touches...",
    "Polishing the doorknobs..."
];

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progressMessage }) => {
    const [dynamicMessage, setDynamicMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDynamicMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 max-w-4xl mx-auto">
      <SparklesIcon className="w-16 h-16 text-sky-400 animate-pulse mb-6" />
      <h2 className="text-3xl font-bold text-white mb-3">Building Your Dream Home</h2>
      <p className="text-slate-400 mb-2">{dynamicMessage}</p>
      <p className="text-sm font-semibold text-sky-500">{progressMessage}</p>
    </div>
  );
};

export default LoadingIndicator;
