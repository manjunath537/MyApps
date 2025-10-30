
import React from 'react';
import { User, Project } from '../types';

interface SidebarProps {
  user: User;
  projects: Project[];
  history: string[];
  onLogout: () => void;
  onNewProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, projects, history, onLogout, onNewProject }) => {
  return (
    <div className="w-80 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800 flex flex-col p-4 space-y-6 h-full">
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          Dream House AI
        </h1>
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-400">Welcome back,</p>
          <p className="font-semibold text-lg text-white">{user.username}</p>
        </div>
      </div>

      <div className="flex-grow flex flex-col min-h-0">
        <button
            onClick={onNewProject}
            className="w-full mb-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
            + New Dream House
        </button>

        <div className="flex-1 flex flex-col min-h-0">
          <h2 className="text-sm font-semibold uppercase text-slate-500 mb-2">Activity History</h2>
          <div className="flex-1 bg-slate-900 rounded-lg p-2 overflow-y-auto">
            {history.length > 0 ? (
              history.map((log, index) => (
                <p key={index} className="text-xs text-slate-400 mb-1 leading-tight">
                  {log}
                </p>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No activity yet.</p>
            )}
          </div>
        </div>
        
        {/* Project list could be implemented here if needed */}
        {/* <div className="mt-4">
          <h2 className="text-sm font-semibold uppercase text-slate-500 mb-2">My Projects</h2>
        </div> */}

      </div>
      
      <div className="flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full text-left py-2 px-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
