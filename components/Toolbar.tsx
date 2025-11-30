import React, { useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Undo, Redo, Sparkles, ChevronDown,
  Type, Palette, Highlighter
} from 'lucide-react';
import { AiMode } from '../types';

interface ToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onAiAction: (mode: AiMode) => void;
  isAiLoading: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ onFormat, onAiAction, isAiLoading }) => {
  const [showAiMenu, setShowAiMenu] = useState(false);

  // Retro Button Style
  const ToolBtn = ({ 
    icon: Icon, 
    onClick, 
    active = false,
    label
  }: { 
    icon: any, 
    onClick: () => void, 
    active?: boolean,
    label?: string
  }) => (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex items-center justify-center p-1 min-w-[28px] h-[26px] mx-[1px]
        border-t border-l border-b-black border-r-black
        ${active 
          ? 'bg-cw-selection border-t-black border-l-black border-b-cw-comment border-r-cw-comment' 
          : 'bg-cw-panel border-cw-comment hover:bg-cw-selection/50 active:border-t-black active:border-l-black active:border-b-cw-comment active:border-r-cw-comment'
        }
      `}
    >
      <Icon size={14} className={active ? 'text-cw-pink' : 'text-cw-text'} />
    </button>
  );

  const Divider = () => (
    <div className="w-[2px] h-[20px] bg-cw-comment/20 mx-1 border-l border-cw-selection/30 border-r border-black/30" />
  );

  return (
    <div className="flex items-center px-1 py-1 border-b border-cw-comment bg-cw-panel select-none relative z-20">
      {/* Handle - Drag Strip */}
      <div className="w-1 h-5 border-l border-cw-comment border-r border-black mr-2"></div>

      <div className="flex items-center space-x-0">
        <ToolBtn icon={Undo} onClick={() => onFormat('undo')} label="Undo" />
        <ToolBtn icon={Redo} onClick={() => onFormat('redo')} label="Redo" />
        <Divider />
        <ToolBtn icon={Bold} onClick={() => onFormat('bold')} label="Bold" />
        <ToolBtn icon={Italic} onClick={() => onFormat('italic')} label="Italic" />
        <ToolBtn icon={Underline} onClick={() => onFormat('underline')} label="Underline" />
        <Divider />
        <ToolBtn icon={AlignLeft} onClick={() => onFormat('justifyLeft')} label="Align Left" />
        <ToolBtn icon={AlignCenter} onClick={() => onFormat('justifyCenter')} label="Align Center" />
        <ToolBtn icon={AlignRight} onClick={() => onFormat('justifyRight')} label="Align Right" />
        <Divider />
        <ToolBtn icon={List} onClick={() => onFormat('insertUnorderedList')} label="Bullet List" />
        <ToolBtn icon={ListOrdered} onClick={() => onFormat('insertOrderedList')} label="Numbered List" />
        
        <Divider />
        
        {/* AI Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAiMenu(!showAiMenu)}
            className={`
              flex items-center gap-2 px-2 h-[26px] mx-1 text-xs font-bold tracking-wide
              border-t border-l border-b-black border-r-black
              transition-colors
              ${isAiLoading 
                ? 'bg-cw-selection cursor-wait border-t-black border-l-black border-b-cw-comment border-r-cw-comment' 
                : 'bg-cw-purple text-cw-bg border-cw-comment hover:brightness-110 active:border-t-black active:border-l-black active:border-b-cw-comment active:border-r-cw-comment'
              }
            `}
          >
            <Sparkles size={12} />
            {isAiLoading ? 'THINKING...' : 'AI ASSIST'}
            <ChevronDown size={10} />
          </button>

          {showAiMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-cw-panel border-2 border-t-cw-comment border-l-cw-comment border-b-black border-r-black shadow-xl z-50">
              {[
                { label: 'Fix Grammar', mode: AiMode.FixGrammar },
                { label: 'Summarize', mode: AiMode.Summarize },
                { label: 'Expand Text', mode: AiMode.Expand },
                { label: 'Make Professional', mode: AiMode.ToneProfessional },
              ].map((item) => (
                <button
                  key={item.mode}
                  onClick={() => {
                    onAiAction(item.mode);
                    setShowAiMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-cw-text hover:bg-cw-selection hover:text-cw-pink transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay to close menu */}
      {showAiMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowAiMenu(false)}
        />
      )}
    </div>
  );
};

export default Toolbar;
