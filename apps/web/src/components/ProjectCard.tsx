import { Link } from 'react-router-dom';
import type { Project, Task } from '../types';
import { formatDate, projectProgress } from '../lib/projectMetrics';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import DeadlineBadge from './DeadlineBadge';
import ProgressBar from './ProgressBar';

export default function ProjectCard({ project, tasks }: { project: Project; tasks: Task[] | null }) {
  const progress = tasks ? projectProgress(project.id, tasks) : null;
  return <article className="surface-glass group flex h-full min-w-0 flex-col p-6 transition-shadow hover:shadow-md">
    <div className="mb-5 flex items-center justify-between gap-3"><span className="icon-tile bg-info-subtle text-info-ink"><Icon name="projects" /></span><StatusBadge status={project.status} /></div>
    <h2 className="text-lg font-semibold"><Link to={`/projects/${project.id}`} className="break-words hover:text-info-ink">{project.name}</Link></h2>
    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-secondary">{project.description || 'A fresh space for your next great idea.'}</p>
    <div className="my-6">
      {progress ? <><div className="mb-2 flex items-center justify-between gap-2 text-xs"><span className="text-secondary">{progress.completed} of {progress.total} tasks complete</span><span className="font-semibold tabular-nums">{progress.percent}%</span></div><ProgressBar value={progress.percent} label={`${project.name} completion`} /></> : <p className="text-xs text-secondary">Task progress unavailable</p>}
    </div>
    <dl className="mb-5 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-secondary">Start date</dt><dd className="mt-1 font-medium">{formatDate(project.startDate)}</dd></div><div><dt className="text-secondary">End date</dt><dd className="mt-1 font-medium">{formatDate(project.endDate)}</dd></div></dl>
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><DeadlineBadge project={project} /><Link className="inline-flex items-center gap-2 text-xs font-semibold hover:text-info-ink" to={`/projects/${project.id}`} aria-label={`Open ${project.name}`}>Open project<Icon name="arrow" className="h-4 w-4" /></Link></div>
    <p className="mt-4 text-xs text-secondary">Created {formatDate(project.createdAt)}</p>
  </article>;
}
