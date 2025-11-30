import React, { useRef } from 'react';
import { Save, FolderOpen, Wand2, Terminal, Eraser } from 'lucide-react';
import { EditorStatus } from '../types';

interface ToolbarProps {
  status: EditorStatus;
  fileName: string;
  onSave: () => void;
  onOpen: (file: File) => void;
  onAIClear: () => void;
  onAIAssist: () => void;
  wordCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  status, 
  fileName, 
  onSave, 
  onOpen, 
  onAIClear, 
  onAIAssist,
  wordCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onOpen(e.target.files[0]);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-retro-bg border-b border-retro-surface flex flex-col md:flex-row items-center justify-between p-3 sticky top-0 z-40">
      <div className="flex items-center gap-4 mb-2 md:mb-0">
        <div className="flex items-center gap-2 text-retro-pink font-code text-xl font-bold">
          <Terminal className="w-5 h-5" />
          <span>RetroWave</span>
        </div>
        <div className="hidden md:block h-5 w-[1px] bg-retro-surface mx-2"></div>
        <span className="text-retro-comment font-code text-sm">{fileName}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept=".txt,.md,.js,.ts,.json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="group px-3 py-1.5 bg-retro-surface rounded text-retro-cyan font-code text-xs font-medium hover:bg-retro-cyan hover:text-retro-bg transition-colors"
          disabled={status === EditorStatus.AI_THINKING}
        >
          <span className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5" /> Open
          </span>
        </button>

        <button 
          onClick={onSave}
          className="group px-3 py-1.5 bg-retro-surface rounded text-retro-green font-code text-xs font-medium hover:bg-retro-green hover:text-retro-bg transition-colors"
          disabled={status === EditorStatus.AI_THINKING}
        >
          <span className="flex items-center gap-2">
            <Save className="w-3.5 h-3.5" /> Save
          </span>
        </button>
        
        <div className="h-5 w-[1px] bg-retro-surface mx-1"></div>

        <button 
          onClick={onAIClear}
          className="group px-3 py-1.5 bg-retro-surface rounded text-retro-red font-code text-xs font-medium hover:bg-retro-red hover:text-retro-bg transition-colors"
          disabled={status === EditorStatus.AI_THINKING}
        >
          <span className="flex items-center gap-2">
            <Eraser className="w-3.5 h-3.5" /> Clear
          </span>
        </button>

        <button 
          onClick={onAIAssist}
          className={`group px-3 py-1.5 rounded font-code text-xs font-medium transition-colors flex items-center gap-2
            ${status === EditorStatus.AI_THINKING 
              ? 'bg-retro-pink text-retro-bg cursor-wait opacity-80' 
              : 'bg-retro-pink text-retro-bg hover:opacity-90'
            }`}
          disabled={status === EditorStatus.AI_THINKING}
        >
          <Wand2 className={`w-3.5 h-3.5 ${status === EditorStatus.AI_THINKING ? 'animate-spin' : ''}`} />
          {status === EditorStatus.AI_THINKING ? 'Working...' : 'AI Assist'}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
