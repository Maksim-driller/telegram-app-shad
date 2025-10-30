import type { ReactNode } from 'react';

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md sm:rounded-xl sm:overflow-hidden bg-white dark:bg-neutral-900 border-t sm:border border-gray-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xl">
        {title ? <div className="text-base font-semibold mb-3">{title}</div> : null}
        {children}
      </div>
    </div>
  );
}


