import React, { useState, useRef, useEffect } from 'react';
import { Save, FolderOpen, Terminal, Sparkles, Trash2, Download, AlertCircle } from 'lucide-react';
import { RetroButton } from './components/RetroButton';
import { EditorStatus } from './types';
import { generateCodeCompletion } from './services/gemini';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(
    `// BEM-VINDO AO EDITOR RETRO v1.0\n// Inicie sua jornada de código aqui...\n\nasync function fetchData() {\n  const [err, res] ?= await fetch("https://api.exemplo.com/dados");\n  \n  if (err) return console.error('erro:', err);\n  return res;\n}`
  );
  const [fileName, setFileName] = useState<string>('sem-titulo.txt');
  const [status, setStatus] = useState<EditorStatus>(EditorStatus.IDLE);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Opening File
  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus(EditorStatus.LOADING);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setContent(text);
        setFileName(file.name);
        setStatus(EditorStatus.IDLE);
      }
    };
    reader.readAsText(file);
  };

  // Handle Saving File
  const handleSaveFile = () => {
    setStatus(EditorStatus.SAVING);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setStatus(EditorStatus.IDLE), 1000);
  };

  // Handle AI Completion
  const handleAiAction = async () => {
    if (!aiPrompt.trim()) return;
    
    setShowAiModal(false);
    setStatus(EditorStatus.AI_THINKING);
    
    try {
      const newCode = await generateCodeCompletion(content, aiPrompt);
      // Append or replace? Let's append for safety or insert at cursor if possible.
      // For simplicity in this demo, we append to the end or replace selection logic could be added.
      // We will simply append to the bottom with a newline for now.
      setContent(prev => `${prev}\n\n// --- RESPOSTA DA IA ---\n${newCode}`);
      setStatus(EditorStatus.IDLE);
      setAiPrompt('');
    } catch (error) {
      console.error(error);
      setStatus(EditorStatus.ERROR);
      setTimeout(() => setStatus(EditorStatus.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] text-[#f8f8f2] font-mono flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Visual Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-30"></div>
      <div className="fixed inset-0 pointer-events-none z-50 bg-gradient-to-b from-transparent via-[rgba(189,147,249,0.03)] to-transparent animate-pulse"></div>

      {/* Main Window Container */}
      <div className="w-full max-w-5xl bg-[#282a36] rounded-lg shadow-[0_0_50px_rgba(189,147,249,0.2)] border border-[#44475a] flex flex-col overflow-hidden relative z-10">
        
        {/* Title Bar */}
        <div className="bg-[#21222c] px-4 py-3 flex items-center justify-between border-b border-[#44475a]">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5555] shadow-[0_0_8px_#ff5555]"></div>
            <div className="w-3 h-3 rounded-full bg-[#f1fa8c] shadow-[0_0_8px_#f1fa8c]"></div>
            <div className="w-3 h-3 rounded-full bg-[#50fa7b] shadow-[0_0_8px_#50fa7b]"></div>
          </div>
          <div className="text-[#bd93f9] text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <Terminal size={16} />
            <span>{fileName}</span>
          </div>
          <div className="w-16"></div> {/* Spacer for center alignment */}
        </div>

        {/* Toolbar */}
        <div className="bg-[#282a36] p-4 flex flex-wrap gap-4 border-b border-[#44475a] items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleOpenFile} 
            accept=".txt,.js,.ts,.css,.html,.json,.md" 
            className="hidden" 
          />
          
          <RetroButton onClick={() => fileInputRef.current?.click()} icon={<FolderOpen size={18} />} variant="warning">
            Abrir
          </RetroButton>
          
          <RetroButton onClick={handleSaveFile} icon={<Save size={18} />} variant="success">
            Salvar
          </RetroButton>
          
          <RetroButton onClick={() => setContent('')} icon={<Trash2 size={18} />} variant="danger">
            Limpar
          </RetroButton>

          <div className="flex-grow"></div>

          <RetroButton onClick={() => setShowAiModal(true)} icon={<Sparkles size={18} />} variant="primary">
            Assistente IA
          </RetroButton>
        </div>

        {/* Text Area */}
        <div className="relative flex-grow h-[60vh]">
          <textarea
            ref={textAreaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 bg-[#282a36] text-[#f8f8f2] resize-none outline-none focus:bg-[#2b2d3a] text-base leading-relaxed selection:bg-[#44475a] selection:text-[#50fa7b]"
            spellCheck={false}
          />
          
          {/* Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#191a21] text-[#6272a4] text-xs px-4 py-2 flex justify-between items-center border-t border-[#44475a]">
            <span>LINHAS: {content.split('\n').length} | CARACTERES: {content.length}</span>
            <span className={`font-bold ${status === EditorStatus.ERROR ? 'text-[#ff5555]' : 'text-[#50fa7b]'}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282a36] border-2 border-[#bd93f9] p-6 rounded-lg w-full max-w-lg shadow-[0_0_30px_rgba(189,147,249,0.4)]">
            <h3 className="text-[#bd93f9] text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="animate-pulse" />
              IA GENERATIVA
            </h3>
            <p className="text-[#f8f8f2] mb-4 text-sm">Descreva o que você quer que a IA escreva ou corrija:</p>
            <textarea
              className="w-full bg-[#191a21] border border-[#44475a] text-[#f8f8f2] p-3 rounded mb-4 outline-none focus:border-[#bd93f9]"
              rows={4}
              placeholder="Ex: Crie uma função para calcular Fibonacci..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-[#6272a4] hover:text-[#f8f8f2] transition-colors font-bold uppercase text-xs"
              >
                Cancelar
              </button>
              <RetroButton onClick={handleAiAction} variant="primary">
                Processar
              </RetroButton>
            </div>
          </div>
        </div>
      )}

      {/* Retro Decoration: Footer Branding */}
      <div className="absolute bottom-4 text-[#6272a4] text-xs opacity-50 select-none">
        SYSTEM READY // MEM: 64KB OK // V 1.0.0
      </div>

    </div>
  );
};

export default App;
