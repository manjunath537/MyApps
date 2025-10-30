import React from 'react';
import { Project } from '../types';
import VideoIcon from './icons/VideoIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import SparklesIcon from './icons/SparklesIcon';


interface ResultDisplayProps {
  project: Project;
  onGenerateVideo: (designArea: string) => void;
  apiKeySelected: boolean;
  onSelectApiKey: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ project, onGenerateVideo, apiKeySelected, onSelectApiKey }) => {

  const Card: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
      <h3 className="text-xl font-bold p-4 bg-slate-900/30 text-sky-400 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">{project.name}</h2>
        <p className="text-slate-400">
          A <span className="font-semibold text-sky-400">{project.preferences.style}</span> style home inspired by a <span className="font-semibold text-sky-400">{project.preferences.colorPalette}</span> palette, with cultural influences from <span className="font-semibold text-sky-400">{project.preferences.country}</span>.
        </p>
      </div>

      {!apiKeySelected && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg text-center">
           <h4 className="font-bold text-lg">Enable 3D Fly-through</h4>
           <p className="text-sm my-2 max-w-2xl mx-auto">
             This feature uses advanced video generation models and requires you to select your own API key. This is a one-time setup. For more information, please see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100 font-semibold">billing documentation</a>.
           </p>
           <button onClick={onSelectApiKey} className="mt-2 bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors">
              Select API Key
           </button>
        </div>
      )}
      
      {project.trendAnalysis && (
        <Card title={`AI Trend Analysis: ${project.preferences.country}`} icon={<SparklesIcon className="w-5 h-5 text-yellow-400" />}>
          <p className="text-slate-300 leading-relaxed">{project.trendAnalysis}</p>
        </Card>
      )}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Bedrooms">
          <p className="text-4xl font-bold text-white">{project.preferences.bedrooms}</p>
        </Card>
        <Card title="Bathrooms">
          <p className="text-4xl font-bold text-white">{project.preferences.bathrooms}</p>
        </Card>
        <Card title="Size">
          <p className="text-4xl font-bold text-white">{project.preferences.squareFootage.toLocaleString()} <span className="text-2xl text-slate-400">sqft</span></p>
        </Card>
      </div>
      
      {project.preferences.features.length > 0 && (
         <Card title="Key Features">
            <div className="flex flex-wrap gap-2">
                {project.preferences.features.map(feature => (
                    <span key={feature} className="px-3 py-1.5 text-sm rounded-full bg-slate-700 text-sky-300 font-medium">
                        {feature}
                    </span>
                ))}
            </div>
        </Card>
      )}


      <div className="space-y-8">
        {project.designs.map((design, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="relative">
               {design.videoUrl ? (
                <video src={design.videoUrl} controls autoPlay loop muted className="w-full h-80 object-cover" />
              ) : design.imageUrl ? (
                <img src={design.imageUrl} alt={`Visualization of ${design.area}`} className="w-full h-80 object-cover" />
              ) : (
                <div className="w-full h-80 bg-slate-700 flex items-center justify-center">
                  <p className="text-slate-500">Image generation in progress...</p>
                </div>
              )}
              {design.isVideoGenerating && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4 text-center">
                    <SpinnerIcon className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-semibold text-lg">Generating 3D Fly-through...</p>
                    <p className="text-sm text-slate-300">This can take a few minutes. Please wait.</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-bold text-sky-400">{design.area}</h3>
                {design.imageUrl && !design.videoUrl && !design.isVideoGenerating && (
                  <button
                    onClick={() => onGenerateVideo(design.area)}
                    disabled={!apiKeySelected}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    title={apiKeySelected ? "Generate 3D Fly-through" : "Please select an API key to enable this feature"}
                  >
                    <VideoIcon className="w-5 h-5" />
                    <span>3D Fly-through</span>
                  </button>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">{design.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;