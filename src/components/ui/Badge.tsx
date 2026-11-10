import React from 'react';
import { LessonLevel } from '../../types/index.ts';

interface BadgeProps {
  children?: React.ReactNode;
  level?: LessonLevel;
  variant?: 'cyan' | 'purple' | 'green' | 'amber' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  level,
  variant,
  className = '',
}) => {
  if (level) {
    if (level === 'beginner') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          <span>🌱</span> Beginner
        </span>
      );
    }
    if (level === 'intermediate') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
        >
          <span>⚡</span> Intermediate
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 ${className}`}
      >
        <span>🔥</span> Advanced
      </span>
    );
  }

  const variantStyles = {
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    neutral: 'bg-[#1E2535] text-[#8892A4] border-[#2A3447]',
  };

  const chosen = variant || 'neutral';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[chosen]} ${className}`}
    >
      {children}
    </span>
  );
};
