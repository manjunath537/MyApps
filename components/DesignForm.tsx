
import React, { useState } from 'react';
import { HousePreferences } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import SpeechToTextButton from './SpeechToTextButton';

interface DesignFormProps {
  onSubmit: (preferences: HousePreferences) => void;
  isLoading: boolean;
}

const DesignForm: React.FC<DesignFormProps> = ({ onSubmit, isLoading }) => {
  const [prefs, setPrefs] = useState<HousePreferences>({
    style: 'Modern',
    bedrooms: 4,
    bathrooms: 3,
    stories: 2,
    squareFootage: 2500,
    features: ['Open Floor Plan', 'Swimming Pool'],
    colorPalette: 'Warm Neutrals',
    additionalRequests: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrefs(prev => ({ ...prev, [name]: name === 'bedrooms' || name === 'bathrooms' || name === 'stories' || name === 'squareFootage' ? parseInt(value) : value }));
  };

  const handleFeatureChange = (feature: string) => {
    setPrefs(prev => {
      const newFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(prefs);
  };
  
  const allFeatures = ['Open Floor Plan', 'Swimming Pool', 'Home Office', 'Gourmet Kitchen', 'Fireplace', 'Balcony', 'Smart Home', 'Home Gym', 'Walk-in Closet'];
  const styles = ['Modern', 'Contemporary', 'Minimalist', 'Industrial', 'Farmhouse', 'Victorian', 'Coastal'];
  const palettes = ['Warm Neutrals', 'Cool Tones', 'Earthy & Organic', 'Monochromatic', 'Bold & Vibrant'];

  return (
    <div className="p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-white">Describe Your Dream House</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Style */}
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-400 mb-2">Architectural Style</label>
            <select id="style" name="style" value={prefs.style} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500">
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Color Palette */}
          <div>
            <label htmlFor="colorPalette" className="block text-sm font-medium text-slate-400 mb-2">Color Palette</label>
            <select id="colorPalette" name="colorPalette" value={prefs.colorPalette} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500">
               {palettes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
             <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-slate-400 mb-2">Bedrooms: <span className="font-bold text-sky-400">{prefs.bedrooms}</span></label>
                <input type="range" id="bedrooms" name="bedrooms" min="1" max="10" value={prefs.bedrooms} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
             <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-slate-400 mb-2">Bathrooms: <span className="font-bold text-sky-400">{prefs.bathrooms}</span></label>
                <input type="range" id="bathrooms" name="bathrooms" min="1" max="8" value={prefs.bathrooms} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
             <div>
                <label htmlFor="stories" className="block text-sm font-medium text-slate-400 mb-2">Stories: <span className="font-bold text-sky-400">{prefs.stories}</span></label>
                <input type="range" id="stories" name="stories" min="1" max="5" value={prefs.stories} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label htmlFor="squareFootage" className="block text-sm font-medium text-slate-400 mb-2">Square Footage: <span className="font-bold text-sky-400">{prefs.squareFootage.toLocaleString()} sqft</span></label>
                <input type="range" id="squareFootage" name="squareFootage" min="500" max="10000" step="100" value={prefs.squareFootage} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Special Features</label>
          <div className="flex flex-wrap gap-2">
            {allFeatures.map(feature => (
              <button key={feature} type="button" onClick={() => handleFeatureChange(feature)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${prefs.features.includes(feature) ? 'bg-sky-500 text-white font-semibold' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {feature}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Requests */}
        <div className="relative">
          <label htmlFor="additionalRequests" className="block text-sm font-medium text-slate-400 mb-2">Additional Requests</label>
          <textarea id="additionalRequests" name="additionalRequests" rows={3} value={prefs.additionalRequests} onChange={handleInputChange}
            placeholder="e.g., 'I want a rooftop garden and a secret library room...'"
            className="w-full bg-slate-700 border-slate-600 rounded-lg p-2.5 focus:ring-sky-500 focus:border-sky-500 pr-10"></textarea>
           <SpeechToTextButton onTranscript={text => setPrefs(p => ({ ...p, additionalRequests: p.additionalRequests + ' ' + text }))} />
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating Your Dream...' : 'Generate My Dream House'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DesignForm;
