
import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({ onTranscript, className }) => {
  const { isListening, toggleListening, supported } = useSpeechRecognition((transcript) => {
    onTranscript(transcript);
  });

  if (!supported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Start listening'}
    >
      <MicrophoneIcon className="w-4 h-4" />
    </button>
  );
};

export default SpeechToTextButton;
