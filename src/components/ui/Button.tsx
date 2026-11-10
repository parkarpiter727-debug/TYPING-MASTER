import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0F14] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-[#0D0F14] font-semibold hover:shadow-[0_0_20px_rgba(0,229,255,0.45)] hover:brightness-105 border border-cyan-300/40',
    accent:
      'bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] text-white font-semibold hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:brightness-105 border border-purple-400/40',
    secondary:
      'border border-[#2A3447] bg-[#161B27]/80 text-[#E8EBF0] hover:border-[#00E5FF]/60 hover:text-[#00E5FF] hover:bg-[#1E2535] backdrop-blur-sm',
    ghost:
      'text-[#8892A4] hover:text-[#E8EBF0] hover:bg-[#1E2535]/70 active:bg-[#1E2535]',
    danger:
      'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
