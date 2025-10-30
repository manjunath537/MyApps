import React from 'react';

interface ColorPaletteProps {
  onSelectColor: (colorDescription: string) => void;
  disabled: boolean;
}

const palettes = [
  { name: 'Serene Blues & Whites', colors: ['bg-sky-200', 'bg-white'], description: 'serene light blues and crisp whites' },
  { name: 'Earthy Greens & Browns', colors: ['bg-green-800', 'bg-amber-800'], description: 'deep earthy greens and warm browns' },
  { name: 'Warm Terracotta & Creams', colors: ['bg-orange-400', 'bg-stone-200'], description: 'warm terracotta and soft creams' },
  { name: 'Modern Grays & Charcoals', colors: ['bg-slate-500', 'bg-slate-800'], description: 'sleek modern grays and deep charcoals' },
  { name: 'Vibrant Jewel Tones', colors: ['bg-emerald-500', 'bg-purple-600'], description: 'rich emerald green and royal purple jewel tones' },
];

const ColorPalette: React.FC<ColorPaletteProps> = ({ onSelectColor, disabled }) => {
  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <h4 className="text-sm font-semibold text-slate-400 mb-3">Recolor this room:</h4>
      <div className="flex flex-wrap gap-3">
        {palettes.map((palette) => (
          <button
            key={palette.name}
            title={palette.name}
            disabled={disabled}
            onClick={() => onSelectColor(palette.description)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all duration-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <div className="flex -space-x-1">
              {palette.colors.map((color, index) => (
                <div key={index} className={`w-4 h-4 rounded-full border-2 border-slate-600 ${color}`} />
              ))}
            </div>
            <span className="text-slate-300">{palette.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
