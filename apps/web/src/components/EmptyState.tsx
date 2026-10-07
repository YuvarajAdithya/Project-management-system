import Icon from './Icon';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}
export default function EmptyState({ title, description, actionText, onAction }: EmptyStateProps) {
  return <div className="empty-panel"><span className="icon-tile mb-5 bg-info-subtle text-info-ink"><Icon name="projects" /></span><h3 className="text-lg font-medium">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-secondary">{description}</p>{actionText && onAction && <button onClick={onAction} className="btn-primary mt-6"><Icon name="plus" className="h-4 w-4" />{actionText}</button>}</div>;
}