import type { DashboardStats } from '../types';
import Icon, { type IconName } from './Icon';

const metrics: { key: keyof DashboardStats; label: string; icon: IconName; tone: string }[] = [
  { key: 'totalProjects', label: 'Total Projects', icon: 'projects', tone: 'bg-info-subtle text-info-ink' },
  { key: 'totalTasks', label: 'Total Tasks', icon: 'tasks', tone: 'bg-surface text-secondary' },
  { key: 'completedTasks', label: 'Completed Tasks', icon: 'check', tone: 'bg-success-subtle text-success-ink' },
  { key: 'pendingTasks', label: 'Pending Tasks', icon: 'clock', tone: 'bg-warning-subtle text-warning-ink' },
  { key: 'projectsInProgress', label: 'Projects In Progress', icon: 'focus', tone: 'bg-info-subtle text-info-ink' },
];

export default function DashboardMetrics({ stats }: { stats: DashboardStats }) {
  return <dl className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">{metrics.map(metric => <div key={metric.key} className="metric-card"><div className="mb-4 flex items-center justify-between"><span className={`icon-tile h-9 w-9 ${metric.tone}`}><Icon name={metric.icon} className="h-4 w-4" /></span></div><dd className="text-3xl font-medium tracking-tight tabular-nums">{stats[metric.key]}</dd><dt className="mt-2 text-xs font-medium text-secondary">{metric.label}</dt></div>)}</dl>;
}
