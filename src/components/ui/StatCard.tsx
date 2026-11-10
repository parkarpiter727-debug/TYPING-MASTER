import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = 'cyan',
}) => {
  const accentStyles = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/30 text-amber-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#161B27] border border-[#2A3447] p-5 shadow-lg bg-gradient-to-br ${accentStyles[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#8892A4]">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-[#1E2535] text-[#E8EBF0]">{icon}</div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-extrabold tracking-tight text-[#E8EBF0] font-mono-code">
          {value}
        </span>
        {subtitle && (
          <p className="mt-1 text-xs text-[#8892A4] font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
