
import React, { useState, useCallback } from 'react';
import { User, Project } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const handleLogin = (username: string) => {
    // In a real app, this would involve a backend call for authentication.
    // For this simulation, we create a user object.
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
    };
    setUser(newUser);
    addToHistory(`User '${username}' logged in.`);
  };

  const handleLogout = () => {
    addToHistory(`User '${user?.username}' logged out.`);
    setUser(null);
    setProjects([]); // Clear projects on logout
  };
  
  const addProject = (newProject: Project) => {
    setProjects(prevProjects => [newProject, ...prevProjects]);
    addToHistory(`New project '${newProject.name}' was created and generated.`);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
    addToHistory(`Project '${updatedProject.name}' was updated with a 3D fly-through.`);
  };

  const addToHistory = useCallback((log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [`[${timestamp}] ${log}`, ...prev].slice(0, 20)); // Keep last 20 history items
  }, []);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      <Dashboard 
        user={user}
        projects={projects}
        addProject={addProject}
        updateProject={updateProject}
        onLogout={handleLogout}
        history={history}
        addToHistory={addToHistory}
      />
    </div>
  );
};

export default App;