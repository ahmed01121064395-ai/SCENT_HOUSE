import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-950/90 border-red-900/50' : 'bg-[var(--bg-secondary)]/95 border-[var(--primary-gold)]/30';
  const textColor = type === 'error' ? 'text-red-400' : 'text-[var(--primary-gold)]';
  const icon = type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check';

  return (
    <div className={`fixed bottom-6 left-6 ${bgColor} border rounded-xl py-3 px-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm z-50 animate-slideUp select-none`}>
      <i className={`${icon} ${textColor} text-sm`}></i>
      <span className="text-[var(--text-primary)] text-xs font-bold font-cairo">{message}</span>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-300 cursor-pointer mr-2 shrink-0">
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
}
