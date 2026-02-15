import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-bg-secondary rounded-t-2xl p-5 pb-8 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-bold text-text-primary">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full hover:bg-bg-elevated transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
