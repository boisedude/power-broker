import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses = {
  default: 'bg-bg-elevated text-text-secondary',
  success: 'bg-green-900/50 text-success',
  warning: 'bg-yellow-900/50 text-warning',
  danger: 'bg-red-900/50 text-danger',
  info: 'bg-blue-900/50 text-info',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
