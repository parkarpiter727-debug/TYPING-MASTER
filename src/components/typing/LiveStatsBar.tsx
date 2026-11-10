import React from 'react';
import { Gauge, Target, AlertTriangle, Clock } from 'lucide-react';
import { formatTime } from '../../lib/typingUtils.ts';

interface LiveStatsBarProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeRemaining?: number;
  elapsedSeconds?: number;
  isCountdown?: boolean;
}

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({
  wpm,
  accuracy,
  errors,
  timeRemaining,
  elapsedSeconds,
  isCountdown = false,
}) => {
  const displayTime = isCountdown
    ? formatTime(timeRemaining ?? 0)
    : formatTime(elapsedSeconds ?? 0);

  return (
    <div className="w-full flex items-center justify-between flex-wrap gap-3 px-5 py-3 rounded-xl bg-[#161B27]/90 border border-[#2A3447] backdrop-blur-sm shadow-md font-mono-code">
      {/* WPM */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-cyan-500/10 text-[#00E5FF]">
          <Gauge className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block">WPM</span>
          <span className="text-xl font-extrabold text-[#00E5FF]">{wpm}</span>
        </div>
      </div>

      {/* Accuracy */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-purple-500/10 text-[#A855F7]">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block">Accuracy</span>
          <span className="text-xl font-extrabold text-[#A855F7]">{accuracy}%</span>
        </div>
      </div>

      {/* Errors */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-red-500/10 text-red-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block">Errors</span>
          <span className="text-xl font-extrabold text-red-400">{errors}</span>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] text-[#8892A4] uppercase tracking-wider block">
            {isCountdown ? 'Time Left' : 'Time'}
          </span>
          <span className="text-xl font-extrabold text-emerald-400">{displayTime}</span>
        </div>
      </div>
    </div>
  );
};
