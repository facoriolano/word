import React from 'react';
import { EditorStatus } from '../types.ts';

interface StatusBarProps {
  status: EditorStatus;
  lines: number;
  chars: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ status, lines, chars }) => {
  const getStatusColor = () => {
    switch (status) {
      case EditorStatus.AI_THINKING: return 'text-retro-pink';
      case EditorStatus.ERROR: return 'text-retro-red';
      case EditorStatus.SAVING: return 'text-retro-green';
      default: return 'text-retro-comment';
    }
  };

  return (
    <div className="h-8 bg-retro-bg border-t border-retro-comment flex-shrink-0 flex items-center justify-between px-4 font-code text-xs select-none z-40">
      <div className="flex items-center gap-4">
        <span className={`uppercase font-bold ${getStatusColor()}`}>
          [{status}]
        </span>
      </div>
      <div className="flex items-center gap-6 text-retro-comment">
        <span>Ln {lines}</span>
        <span>Ch {chars}</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">TXT</span>
      </div>
    </div>
  );
};

export default StatusBar;
