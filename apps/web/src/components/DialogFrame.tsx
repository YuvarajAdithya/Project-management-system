import { useEffect, useRef, type ReactNode } from 'react';
import Icon from './Icon';

export default function DialogFrame({ open, title, onClose, busy = false, children }: { open: boolean; title: string; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);
  if (!open) return null;
  return <dialog ref={ref} className="dialog-frame" aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!busy && event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) onClose();
  }}><div className="dialog-body"><header className="mb-6 flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{title}</h2><button type="button" className="btn-icon" aria-label="Close dialog" disabled={busy} onClick={onClose}><Icon name="close" /></button></header>{children}</div></dialog>;
}
