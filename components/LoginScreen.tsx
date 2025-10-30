
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-900/50 border border-slate-700 p-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 mb-2">
          Dream House AI
        </h1>
        <p className="text-slate-400 mb-8">Design your future home today.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name to begin"
              className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-200 text-white placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            Start Designing
          </button>
        </form>
        <p className="text-xs text-slate-600 mt-8">
          This is a demonstration app. No account is created, and data is not persisted.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
