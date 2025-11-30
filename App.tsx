import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import AIPromptModal from './components/AIPromptModal';
import { FileData, EditorStatus, ToastMessage } from './types';
import { generateAICompletion } from './services/geminiService';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(`// Welcome to RetroWave Editor v1.0
// Styled with the Dracula/Synthwave palette.
// Type away, or ask the AI Oracle for help.

function helloWorld() {
  const greeting = "Hello, Retro World!";
  console.log(greeting);
}
`);
  const [fileName, setFileName] = useState<string>('untitled.txt');
  const [status, setStatus] = useState<EditorStatus>(EditorStatus.IDLE);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Text Stats
  const lines = content.split('\n').length;
  const chars = content.length;

  // Toast Helper
  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // File Handlers
  const handleSave = useCallback(() => {
    try {
      setStatus(EditorStatus.SAVING);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('File saved successfully!', 'success');
      setStatus(EditorStatus.IDLE);
    } catch (e) {
      console.error(e);
      setStatus(EditorStatus.ERROR);
      addToast('Failed to save file.', 'error');
    }
  }, [content, fileName]);

  const handleOpen = useCallback(async (file: File) => {
    try {
      setStatus(EditorStatus.LOADING);
      const text = await file.text();
      setContent(text);
      setFileName(file.name);
      addToast(`Opened ${file.name}`, 'success');
      setStatus(EditorStatus.IDLE);
    } catch (e) {
      console.error(e);
      setStatus(EditorStatus.ERROR);
      addToast('Failed to read file.', 'error');
    }
  }, []);

  const handleAIRequest = async (prompt: string) => {
    try {
      setStatus(EditorStatus.AI_THINKING);
      const result = await generateAICompletion(content, prompt);
      
      // If result is not empty, update content
      if (result) {
         setContent(result);
         addToast('AI Oracle has spoken.', 'success');
      } else {
         addToast('AI returned no content.', 'info');
      }
      
      setStatus(EditorStatus.IDLE);
    } catch (e) {
      console.error(e);
      setStatus(EditorStatus.ERROR);
      addToast('AI Connection Failed. Check API Key.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text flex flex-col font-code relative overflow-hidden">
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[70] flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-2 rounded shadow-md font-code text-sm transition-all duration-300
              ${toast.type === 'success' ? 'bg-retro-green/20 text-retro-green border border-retro-green' : 
                toast.type === 'error' ? 'bg-retro-red/20 text-retro-red border border-retro-red' : 
                'bg-retro-cyan/20 text-retro-cyan border border-retro-cyan'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <Toolbar 
        status={status}
        fileName={fileName}
        onSave={handleSave}
        onOpen={handleOpen}
        onAIClear={() => setContent('')}
        onAIAssist={() => setIsAIModalOpen(true)}
        wordCount={content.split(/\s+/).filter(Boolean).length}
      />

      <main className="flex-grow flex relative z-0">
        {/* Line Numbers */}
        <div className="bg-retro-bg w-12 md:w-16 flex flex-col items-end py-4 px-3 select-none text-retro-comment text-sm md:text-base border-r border-retro-surface">
          {Array.from({ length: Math.min(lines, 1000) }).map((_, i) => (
             <div key={i} className="leading-6 opacity-60 hover:text-retro-text transition-colors">{i + 1}</div>
          ))}
          {lines > 1000 && <div className="text-xs">...</div>}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow bg-retro-bg text-retro-text p-4 resize-none focus:outline-none leading-6 font-code text-sm md:text-base selection:bg-retro-comment selection:text-white"
          spellCheck={false}
        />
      </main>

      <StatusBar status={status} lines={lines} chars={chars} />
      
      <AIPromptModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onSubmit={handleAIRequest} 
      />
    </div>
  );
};

export default App;
