import type { Task } from '../types';
import { daysUntil, formatDate } from '../lib/projectMetrics';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

export default function ProjectTaskList({ tasks, busyId, onToggle, onEdit, onDelete }: { tasks: Task[]; busyId: string | null; onToggle: (task: Task) => void; onEdit: (task: Task) => void; onDelete: (id: string) => void }) {
  return <ul className="surface-glass divide-y divide-line overflow-hidden rounded-xl">{tasks.map(task => {
    const overdue = task.status !== 'COMPLETED' && (daysUntil(task.dueDate) ?? 0) < 0;
    return <li key={task.id} className="flex flex-wrap items-start gap-4 p-5 sm:p-6">
      <input type="checkbox" className="task-check mt-1" aria-label={`Mark ${task.name} ${task.status === 'COMPLETED' ? 'pending' : 'completed'}`} checked={task.status === 'COMPLETED'} disabled={busyId !== null} onChange={() => onToggle(task)} />
      <div className="min-w-0 flex-1"><h3 className={`break-words text-sm font-semibold ${task.status === 'COMPLETED' ? 'text-secondary line-through' : 'text-ink'}`}>{task.name}</h3>{task.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-secondary">{task.description}</p>}<div className="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status={task.status} /><StatusBadge status={task.priority} /><span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'font-medium text-danger-ink' : 'text-secondary'}`}><Icon name="calendar" className="h-3.5 w-3.5" />{task.dueDate ? `${overdue ? 'Overdue · ' : 'Due '}${formatDate(task.dueDate)}` : 'No due date'}</span></div><p className="mt-2 text-xs text-secondary">Created {formatDate(task.createdAt)}</p></div>
      <div className="flex gap-1"><button className="btn-icon" onClick={() => onEdit(task)} disabled={busyId !== null} aria-label={`Edit ${task.name}`} title="Edit task"><Icon name="edit" className="h-4 w-4" /></button><button className="btn-icon text-danger-ink hover:text-danger-ink" onClick={() => onDelete(task.id)} disabled={busyId !== null} aria-label={`Delete ${task.name}`} title="Delete task"><Icon name="trash" className="h-4 w-4" /></button></div>
    </li>;
  })}</ul>;
}
