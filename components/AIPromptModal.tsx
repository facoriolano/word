import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
      setInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-retro-bg border border-retro-surface w-full max-w-lg shadow-xl rounded-lg overflow-hidden">
        <div className="bg-retro-surface p-3 border-b border-retro-bg flex justify-between items-center">
          <span className="flex items-center gap-2 text-retro-pink font-bold font-code text-sm">
            <Sparkles className="w-4 h-4"/> AI Assistant
          </span>
          <button onClick={onClose} className="text-retro-comment hover:text-retro-text transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-retro-text/80 font-code text-sm mb-3">
            How can I help you with your code today?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-retro-bg border border-retro-surface text-retro-text p-3 font-code rounded focus:outline-none focus:border-retro-pink transition-colors resize-none text-sm"
            placeholder="e.g., 'Refactor this function', 'Explain this code', 'Convert to TypeScript'..."
            autoFocus
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-retro-comment font-code text-xs font-medium hover:text-retro-text transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-retro-pink text-retro-bg font-bold font-code text-xs rounded hover:opacity-90 transition-opacity"
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIPromptModal;
