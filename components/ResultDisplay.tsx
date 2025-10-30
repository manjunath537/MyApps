import React, { useState } from 'react';
import { Project } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ColorPalette from './ColorPalette';
import { changeImageColor } from '../services/geminiService';


interface ResultDisplayProps {
  project: Project;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ project }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [recoloringIndex, setRecoloringIndex] = useState<number | null>(null);
  const [recolorError, setRecolorError] = useState<string | null>(null);

  const Card: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
      <h3 className="text-xl font-bold p-4 bg-slate-900/30 text-sky-400 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </div>
  );

  const handleRecolor = async (designIndex: number, colorDescription: string) => {
    setRecoloringIndex(designIndex);
    setRecolorError(null);
    const originalDesign = currentProject.designs[designIndex];

    if (!originalDesign.imageUrl) {
      setRecolorError("Cannot recolor an image that hasn't been generated yet.");
      setRecoloringIndex(null);
      return;
    }

    try {
      const [header, base64Data] = originalDesign.imageUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1];

      if (!base64Data || !mimeType) {
        throw new Error("Invalid image data URL.");
      }

      const newImageUrl = await changeImageColor(base64Data, mimeType, colorDescription);

      setCurrentProject(prev => {
        const newDesigns = [...prev.designs];
        newDesigns[designIndex] = { ...newDesigns[designIndex], imageUrl: newImageUrl };
        return { ...prev, designs: newDesigns };
      });

    } catch (error) {
      console.error("Recoloring failed:", error);
      setRecolorError("Sorry, the image could not be recolored. Please try again.");
    } finally {
      setRecoloringIndex(null);
    }
  };


  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2">{project.name}</h2>
        <p className="text-slate-400">
          A <span className="font-semibold text-sky-400">{project.preferences.style}</span> style home inspired by a <span className="font-semibold text-sky-400">{project.preferences.colorPalette}</span> palette, with cultural influences from <span className="font-semibold text-sky-400">{project.preferences.country}</span>.
        </p>
      </div>

       {currentProject.budget && (
        <Card title="Budget Projection" icon={<span className="text-2xl">💰</span>}>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">{currentProject.budget.overallEstimate}</p>
            <p className="text-slate-300 leading-relaxed">{currentProject.budget.summary}</p>
          </div>
        </Card>
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

      {recolorError && 
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
            {recolorError}
        </div>
      }

      <div className="space-y-8">
        {currentProject.designs.map((design, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="relative">
               {design.imageUrl ? (
                <img src={design.imageUrl} alt={`Visualization of ${design.area}`} className="w-full h-96 object-cover" />
              ) : (
                <div className="w-full h-96 bg-slate-700 flex items-center justify-center">
                  <p className="text-slate-500">Image generation in progress...</p>
                </div>
              )}
               {recoloringIndex === index && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center transition-opacity duration-300">
                    <SpinnerIcon className="w-12 h-12 text-sky-400 animate-spin" />
                    <p className="mt-4 text-lg font-semibold text-white">Recoloring...</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="text-2xl font-bold text-sky-400">{design.area}</h3>
                {design.budgetEstimate && (
                  <p className="text-lg font-semibold text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full whitespace-nowrap">
                    ~{design.budgetEstimate}
                  </p>
                )}
              </div>
              <p className="text-slate-300 leading-relaxed">{design.description}</p>
              {design.imageUrl && <ColorPalette onSelectColor={(color) => handleRecolor(index, color)} disabled={recoloringIndex !== null} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;