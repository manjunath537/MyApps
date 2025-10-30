import React, { useState, useEffect } from 'react';
import { User, Project, HousePreferences } from '../types';
import Sidebar from './Sidebar';
import DesignForm from './DesignForm';
import ResultDisplay from './ResultDisplay';
import LoadingIndicator from './LoadingIndicator';
import { generateDesignsAndTrends, generateImageForDesign } from '../services/geminiService';
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
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // Use `(window as any)` to bypass TypeScript check for aistudio
      if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      // Optimistically set to true, as the dialog handles the rest.
      await (window as any).aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  };

  const handleFormSubmit = async (preferences: HousePreferences) => {
    setCurrentView('LOADING');
    setError(null);
    addToHistory(`Generating new design for a ${preferences.style} House in ${preferences.country}.`);
    setProgressMessage("Generating design descriptions and trend analysis...");

    try {
      const { designs, trendAnalysis, budget } = await generateDesignsAndTrends(preferences);

      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: `My ${preferences.style} House in ${preferences.country}`,
        preferences: preferences,
        designs: designs,
        trendAnalysis: trendAnalysis,
        budget: budget,
        createdAt: new Date(),
      };

      setActiveProject(newProject);
      setCurrentView('RESULT');

      // Generate images in the background, handling individual errors
      const designsWithImages = await Promise.all(designs.map(async (design, index) => {
        try {
            setProgressMessage(`Generating image for ${design.area}... (${index + 1}/${designs.length})`);
            const imageUrl = await generateImageForDesign(design.description, preferences);
            return { ...design, imageUrl };
        } catch (imageError) {
            console.error(`Failed to generate image for ${design.area}:`, imageError);
            addToHistory(`Failed to generate image for ${design.area}.`);
            // Return the design without an image URL so the app doesn't crash
            return { ...design, imageUrl: undefined };
        }
      }));

      const finalProject: Project = { ...newProject, designs: designsWithImages };
      
      setActiveProject(finalProject);
      addProject(finalProject);
      setProgressMessage('');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      
      if (errorMessage.includes("API key not valid") || errorMessage.includes("provide an API key")) {
        setError("Your API key is not valid. Please select a valid key and try again.");
        setApiKeySelected(false); // Force re-selection
      } else {
        setError(`Failed to generate design. ${errorMessage}`);
      }
      
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
  
  const ApiKeyPrompt = () => (
    <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-3">API Key Required</h2>
      <p className="text-slate-400 mb-6 max-w-md">
        To generate house designs, this application requires a Google AI API key. Please select your key to proceed.
      </p>
      <button 
        onClick={handleSelectKey}
        className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
      >
        Select Your API Key
      </button>
      <p className="text-xs text-slate-500 mt-4">
        Ensure your key is enabled for the Gemini API. For more information on billing, visit{' '}
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sky-400 hover:underline"
        >
          ai.google.dev/gemini-api/docs/billing
        </a>.
      </p>
    </div>
  );


  const renderContent = () => {
    if (!apiKeySelected) {
        return <ApiKeyPrompt />;
    }

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
              <DesignForm onSubmit={handleFormSubmit} isLoading={currentView === 'LOADING'} />
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