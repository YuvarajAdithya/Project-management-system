import { Link } from 'react-router-dom';
import type { Project, Task } from '../types';
import { daysUntil, formatDate } from '../lib/projectMetrics';
import Icon from './Icon';
import StatusBadge from './StatusBadge';

export default function DashboardTaskList({ title, description, tasks, projects, emptyText, compact = false }: { title: string; description: string; tasks: Task[] | null; projects: Project[] | null; emptyText: string; compact?: boolean }) {
  return <section className="panel"><header className="mb-3 flex items-start justify-between gap-3"><div><h2 className="section-title">{title}</h2><p className="mt-1 text-xs leading-5 text-secondary">{description}</p></div><Icon name={compact ? 'calendar' : 'focus'} className="mt-1 h-5 w-5 text-secondary" /></header>
    {tasks === null ? <p className="py-6 text-sm text-secondary">Task data is unavailable. Please retry loading the dashboard.</p> : tasks.length === 0 ? <div className="py-7"><span className="icon-tile mb-3 bg-success-subtle text-success-ink"><Icon name="check" /></span><p className="text-sm leading-6 text-secondary">{emptyText}</p><Link to="/tasks" className="mt-3 inline-flex text-xs font-semibold text-info-ink">View all tasks</Link></div> : <ul>{tasks.slice(0, 4).map(task => {
      const days = daysUntil(task.dueDate);
      return <li key={task.id} className="task-list-row flex-nowrap"><span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full sm:flex ${days !== null && days < 0 ? 'bg-danger-subtle text-danger-ink' : 'bg-info-subtle text-info-ink'}`}><Icon name={days !== null && days < 0 ? 'clock' : 'tasks'} className="h-4 w-4" /></span><div className="min-w-0 flex-1"><Link to={`/projects/${task.projectId}`} className="block break-words text-sm font-medium hover:text-info-ink">{task.name}</Link><p className="mt-1 truncate text-xs text-secondary">{projects?.find(project => project.id === task.projectId)?.name || 'View project'}</p><p className={`mt-1 text-xs ${days !== null && days < 0 ? 'text-danger-ink' : 'text-secondary'}`}>{days === null ? 'No due date' : days < 0 ? `Overdue · ${formatDate(task.dueDate)}` : days === 0 ? 'Due today' : formatDate(task.dueDate)}</p></div>{!compact && <StatusBadge status={task.priority} />}</li>;
    })}</ul>}
  </section>;
}
