import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: 'cyan' | 'purple' | 'none';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  hover = false,
  ...props
}) => {
  const glowStyles = {
    cyan: 'border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.15)]',
    purple: 'border-[#A855F7]/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    none: 'border-[#2A3447]',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:border-[#00E5FF]/50 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
    : '';

  return (
    <div
      className={`bg-[#161B27] rounded-xl border ${glowStyles[glow]} ${hoverStyles} p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
