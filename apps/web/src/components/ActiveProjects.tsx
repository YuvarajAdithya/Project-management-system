import { Link } from 'react-router-dom';
import type { Project, Task } from '../types';
import { formatDate, projectProgress } from '../lib/projectMetrics';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import Icon from './Icon';

export default function ActiveProjects({ projects, tasks }: { projects: Project[] | null; tasks: Task[] | null }) {
  const active = projects?.filter(project => project.status !== 'COMPLETED').slice(0, 3);
  return <section className="surface-contrast p-6 sm:p-7"><header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">Keep things moving</p><h2 className="text-xl font-medium">Active projects</h2></div><Link to="/projects" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs text-white/90 hover:bg-white/10">All projects<Icon name="arrow" className="h-4 w-4" /></Link></header>
    {active?.length ? <ul className="space-y-6">{active.map(project => {
      const progress = tasks ? projectProgress(project.id, tasks) : null;
      return <li key={project.id}><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><Link to={`/projects/${project.id}`} className="min-w-0 break-words text-sm font-medium hover:text-accent">{project.name}</Link><StatusBadge status={project.status} /></div>{progress ? <><ProgressBar dark value={progress.percent} label={`${project.name} completion`} /><div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-white/65"><span>{progress.completed}/{progress.total} tasks · {progress.percent}%</span><span>{project.endDate ? `Due ${formatDate(project.endDate)}` : 'No deadline'}</span></div></> : <p className="text-xs text-white/65">Task progress unavailable</p>}</li>;
    })}</ul> : <p className="py-3 text-sm leading-6 text-white/70">{projects === null ? 'Project data is unavailable. Please retry loading the dashboard.' : 'No active projects right now. Start a new project when you’re ready.'}</p>}
  </section>;
}
