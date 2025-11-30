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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-retro-bg border border-retro-surface w-full max-w-lg shadow-2xl rounded-lg overflow-hidden transform transition-all">
        <div className="bg-retro-surface p-4 border-b border-retro-bg flex justify-between items-center">
          <span className="flex items-center gap-2 text-retro-pink font-bold font-code text-base">
            <Sparkles className="w-5 h-5"/> AI Assistant
          </span>
          <button onClick={onClose} className="text-retro-comment hover:text-retro-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-retro-text font-code text-sm mb-3">
            What would you like the AI to do?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 bg-retro-bg border border-retro-surface text-retro-text p-4 font-code rounded-md focus:outline-none focus:border-retro-pink focus:ring-1 focus:ring-retro-pink transition-all resize-none text-sm"
            placeholder="e.g., 'Refactor this code', 'Add comments', 'Fix bugs'..."
            autoFocus
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-retro-comment font-code text-sm font-medium hover:text-retro-text transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-retro-pink text-retro-bg font-bold font-code text-sm rounded-md hover:bg-retro-pink/90 transition-all shadow-md"
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
