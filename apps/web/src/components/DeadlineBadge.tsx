import type { Project } from '../types';
import { deadlineHealth } from '../lib/projectMetrics';

const tones = { neutral: 'badge-neutral', success: 'badge-success', warning: 'badge-warning', danger: 'badge-danger', info: 'badge-info' };
export default function DeadlineBadge({ project }: { project: Project }) {
  const health = deadlineHealth(project);
  return <span className={`badge ${tones[health.tone]}`}><span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />{health.label}</span>;
}
