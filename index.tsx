import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Minus, Square, X, 
  FileText, Settings, HelpCircle, 
  Type, Save, Printer
} from 'lucide-react';
import { INITIAL_CONTENT } from './constants';
import Toolbar from './components/Toolbar';
import { generateAiContent } from './services/geminiService';
import { AiMode } from './types';

const App = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Initial stats
    updateStats();
    
    // Clock timer
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setWordCount(text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length);
    setCharCount(text.length);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateStats();
  };

  const handleAiAction = async (mode: AiMode) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
      alert("Please select some text to process with AI.");
      return;
    }
    
    const text = selection.toString();
    setIsAiLoading(true);
    
    try {
      const result = await generateAiContent(text, mode);
      if (result) {
        // Attempt to preserve some formatting by using insertText, 
        // effectively replacing the selection with the AI result.
        document.execCommand('insertText', false, result);
      }
    } catch (e) {
      console.error("AI Error:", e);
      alert("Failed to generate AI content.");
    } finally {
      setIsAiLoading(false);
      updateStats();
    }
  };

  const toggleMaximize = () => setIsMaximized(!isMaximized);

  // Retro Button Component
  const WinButton = ({ children, onClick, className = "", red = false }: { children: React.ReactNode, onClick?: () => void, className?: string, red?: boolean }) => (
    <button 
      onClick={onClick}
      className={`
        flex items-center justify-center w-5 h-5 
        border-t border-l border-b-black border-r-black 
        active:border-t-black active:border-l-black active:border-b-cw-comment active:border-r-cw-comment
        active:bg-cw-selection
        ${red ? 'bg-cw-pink text-cw-bg' : 'bg-cw-panel border-cw-comment text-cw-comment'}
        ${className}
      `}
    >
      {children}
    </button>
  );

  return (
    <div className={`h-full w-full flex items-center justify-center p-4 bg-cw-bg font-sans transition-all duration-300 ${isMaximized ? 'p-0' : ''}`}>
      
      {/* Main Window */}
      <div className={`
        flex flex-col bg-cw-panel shadow-[10px_10px_0_0_rgba(0,0,0,0.5)]
        border-2 border-t-cw-comment border-l-cw-comment border-b-black border-r-black
        ${isMaximized ? 'w-full h-full' : 'w-full max-w-5xl h-[85vh]'}
      `}>
        
        {/* Title Bar */}
        <div className="h-8 bg-gradient-to-r from-cw-purple to-cw-pink flex items-center justify-between px-1 select-none">
          <div className="flex items-center gap-2 px-1">
            <FileText size={16} className="text-cw-bg" />
            <span className="font-bold text-cw-bg text-sm tracking-wide">CodeWord 98 - Untitled.doc</span>
          </div>
          <div className="flex gap-1">
            <WinButton><Minus size={10} /></WinButton>
            <WinButton onClick={toggleMaximize}><Square size={10} /></WinButton>
            <WinButton red onClick={() => window.location.reload()}><X size={12} /></WinButton>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex px-1 py-1 space-x-4 text-sm text-cw-text border-b border-cw-comment select-none">
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Table', 'Window', 'Help'].map(menu => (
            <span key={menu} className="px-1 cursor-pointer hover:bg-cw-selection hover:text-white first-letter:underline">
              {menu}
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <Toolbar 
          onFormat={handleFormat} 
          onAiAction={handleAiAction} 
          isAiLoading={isAiLoading} 
        />

        {/* Ruler (Visual Only) */}
        <div className="h-6 bg-cw-panel border-b border-cw-comment flex items-end px-4 overflow-hidden relative">
          <div className="w-full h-1/2 bg-cw-paper border border-cw-comment flex justify-between px-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-full w-px bg-cw-comment opacity-50 text-[8px] pt-1">{i % 5 === 0 ? i : ''}</div>
            ))}
          </div>
        </div>

        {/* Editor Area (Workspace) */}
        <div className="flex-1 bg-cw-selection/30 overflow-auto p-8 flex justify-center relative cursor-text" onClick={() => editorRef.current?.focus()}>
          
          {/* The Page */}
          <div 
            className="bg-cw-paper w-full max-w-[800px] min-h-[1000px] shadow-2xl relative"
            style={{ fontFamily: '"Fira Code", monospace' }}
          >
             {/* Content */}
             <div 
              ref={editorRef}
              contentEditable
              className="w-full h-full p-12 outline-none text-cw-text leading-relaxed whitespace-pre-wrap selection:bg-cw-pink selection:text-cw-bg"
              dangerouslySetInnerHTML={{ __html: INITIAL_CONTENT }}
              onInput={updateStats}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-cw-panel border-t border-cw-comment flex items-center justify-between px-3 text-xs text-cw-comment select-none">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">Page 1/1</span>
            <span className="flex items-center gap-1 border-l border-cw-selection pl-4">Sec 1</span>
            <span className="flex items-center gap-1 border-l border-cw-selection pl-4">{wordCount} words</span>
            <span className="flex items-center gap-1 border-l border-cw-selection pl-4">{charCount} chars</span>
          </div>
          <div className="flex gap-6">
            <span className="uppercase">OVR</span>
            <span className="uppercase text-cw-text font-bold">INS</span>
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
