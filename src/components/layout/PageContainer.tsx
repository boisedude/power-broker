import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function PageContainer({ children, className = '', title }: PageContainerProps) {
  return (
    <div className={`px-4 py-4 pb-20 max-w-lg mx-auto ${className}`}>
      {title && <h1 className="text-xl font-bold text-text-primary mb-4">{title}</h1>}
      {children}
    </div>
  );
}
