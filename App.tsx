import React, { useState, useCallback, useRef } from 'react';
import Toolbar from './components/Toolbar.tsx';
import StatusBar from './components/StatusBar.tsx';
import AIPromptModal from './components/AIPromptModal.tsx';
import { EditorStatus, ToastMessage } from './types.ts';
import { generateAICompletion } from './services/geminiService.ts';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(`// Welcome to RetroWave Editor v1.0
// Styled with the Dracula/Synthwave palette.
// Type away, or ask the AI Oracle for help.

function helloWorld() {
  const greeting = "Hello, World!";
  console.log(greeting);
}
`);
  const [fileName, setFileName] = useState<string>('untitled.txt');
  const [status, setStatus] = useState<EditorStatus>(EditorStatus.IDLE);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Refs for scroll sync
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

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

  // Scroll Handler
  const handleScroll = () => {
    if (textAreaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
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
      
      if (result) {
         setContent(result);
         addToast('AI Request completed.', 'success');
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
    <div className="h-full flex flex-col bg-retro-bg text-retro-text font-code overflow-hidden">
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded shadow-lg font-code text-sm transition-all duration-300 border
              ${toast.type === 'success' ? 'bg-retro-surface text-retro-green border-retro-green' : 
                toast.type === 'error' ? 'bg-retro-surface text-retro-red border-retro-red' : 
                'bg-retro-surface text-retro-cyan border-retro-cyan'}`}
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

      <main className="flex-1 flex flex-row min-h-0 relative">
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="bg-retro-bg w-14 flex-shrink-0 flex flex-col items-end py-4 px-3 select-none text-retro-comment text-sm border-r border-retro-surface overflow-hidden"
        >
          {Array.from({ length: Math.min(lines, 2000) }).map((_, i) => (
             <div key={i} className="leading-6 h-6">{i + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textAreaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={handleScroll}
          className="flex-1 w-full h-full bg-retro-bg text-retro-text p-4 resize-none focus:outline-none leading-6 font-code text-base selection:bg-retro-comment selection:text-white border-0"
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
