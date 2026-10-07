import DialogFrame from './DialogFrame';
import Icon from './Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isProcessing }: ConfirmDialogProps) {
  return <DialogFrame open={isOpen} title={title} onClose={onCancel} busy={isProcessing}>
    <span className="icon-tile mb-4 bg-danger-subtle text-danger-ink"><Icon name="trash" /></span><p className="text-sm leading-7 text-secondary">{message}</p>
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" className="btn-secondary" onClick={onCancel} disabled={isProcessing}>Cancel</button><button type="button" className="btn-danger" onClick={onConfirm} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Confirm'}</button></div>
  </DialogFrame>;
}