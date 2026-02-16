import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: 'red' | 'blue' | 'gold' | 'green' | 'none';
}

const accentClasses = {
  red: 'border-l-4 border-l-red-campaign',
  blue: 'border-l-4 border-l-blue-campaign',
  gold: 'border-l-4 border-l-gold-campaign',
  green: 'border-l-4 border-l-success',
  none: '',
};

export function Card({ children, className = '', onClick, accent = 'none' }: CardProps) {
  return (
    <div
      className={`
        bg-bg-card rounded-xl p-4 border border-navy-700/50
        ${accentClasses[accent]}
        ${onClick ? 'cursor-pointer active:bg-bg-elevated transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
