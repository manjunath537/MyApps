
import React, { useState } from 'react';
import { User, Project, HousePreferences, RoomDesign } from '../types';
import Sidebar from './Sidebar';
import DesignForm from './DesignForm';
import ResultDisplay from './ResultDisplay';
import LoadingIndicator from './LoadingIndicator';
import { generateHouseDesigns, generateImageForDesign } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';


interface DashboardProps {
  user: User;
  projects: Project[];
  addProject: (project: Project) => void;
  onLogout: () => void;
  history: string[];
  addToHistory: (log: string) => void;
}

type View = 'FORM' | 'LOADING' | 'RESULT';

const Dashboard: React.FC<DashboardProps> = ({ user, projects, addProject, onLogout, history, addToHistory }) => {
  const [currentView, setCurrentView] = useState<View>('FORM');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (preferences: HousePreferences) => {
    setCurrentView('LOADING');
    setError(null);
    addToHistory(`Generating new design for project 'My ${preferences.style} House'.`);
    setProgressMessage("Generating design descriptions...");

    try {
      const designDescriptions = await generateHouseDesigns(preferences);

      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: `My ${preferences.style} House`,
        preferences: preferences,
        designs: designDescriptions,
        createdAt: new Date(),
      };

      setActiveProject(newProject);
      setCurrentView('RESULT');

      // Generate images in the background
      const imagePromises = designDescriptions.map(async (design, index) => {
        setProgressMessage(`Generating image for ${design.area}... (${index + 1}/${designDescriptions.length})`);
        const imageUrl = await generateImageForDesign(design.description, preferences);
        return { ...design, imageUrl };
      });

      const designsWithImages = await Promise.all(imagePromises);

      const finalProject: Project = { ...newProject, designs: designsWithImages };
      
      setActiveProject(finalProject);
      addProject(finalProject);
      setProgressMessage('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`Failed to generate design. ${errorMessage}`);
      setCurrentView('FORM');
      addToHistory(`Error generating design.`);
    }
  };
  
  const startNewProject = () => {
    setActiveProject(null);
    setCurrentView('FORM');
    setError(null);
    addToHistory('Started a new project form.');
  }

  const renderContent = () => {
    switch (currentView) {
      case 'LOADING':
        return <LoadingIndicator progressMessage={progressMessage} />;
      case 'RESULT':
        return activeProject && <ResultDisplay project={activeProject} />;
      case 'FORM':
      default:
        return (
            <div>
              {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6">{error}</div>}
              {projects.length === 0 ? (
                  <DesignForm onSubmit={handleFormSubmit} isLoading={currentView === 'LOADING'} />
              ) : (
                <div className="p-8 text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 max-w-4xl mx-auto">
                    <SparklesIcon className="w-16 h-16 text-sky-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                    <p className="text-slate-400 mb-6">You can start a new project or view your previous designs from the sidebar.</p>
                    <button onClick={startNewProject}
                        className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Create a New Dream House
                    </button>
                    {activeProject && <div className="mt-8"><ResultDisplay project={activeProject} /></div>}
                </div>
              )}
            </div>
        )
    }
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar 
        user={user} 
        projects={projects} 
        onLogout={onLogout} 
        history={history}
        onNewProject={startNewProject}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-dots">
        <div className="container mx-auto">
          {renderContent()}
        </div>
      </main>
      <style>{`
        .bg-dots {
          background-image: radial-gradient(#1e293b 1px, transparent 1px);
          background-size: 16px 16px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
