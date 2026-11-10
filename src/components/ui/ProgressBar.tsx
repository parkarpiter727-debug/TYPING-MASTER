import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-[#8892A4]">
          <span>Progress</span>
          <span className="font-mono-code font-semibold">{clamped}%</span>
        </div>
      )}
      <div
        className="w-full bg-[#1E2535] rounded-full overflow-hidden border border-[#2A3447]/60"
        style={{ height: `${height}px` }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#00E5FF] to-[#A855F7] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
