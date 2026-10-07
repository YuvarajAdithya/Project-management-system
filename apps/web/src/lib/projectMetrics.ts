import type { Project, Task } from '../types';

export const completionPercent = (completed: number, total: number) => total > 0 ? Math.min(100, Math.max(0, Math.round(completed / total * 100))) : 0;

export function taskProgress(tasks: Task[]) {
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  return { completed, total: tasks.length, percent: completionPercent(completed, tasks.length) };
}

export const projectProgress = (id: string, tasks: Task[]) => taskProgress(tasks.filter(task => task.projectId === id));

// These fields come from date inputs. Preserve their calendar day across time
// zones; compare UTC day numbers to avoid daylight-saving hour differences.
export function daysUntil(value?: string | null, now = new Date()): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const target = Date.parse(`${value.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(target)) return null;
  return Math.round((target - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

export function formatDate(value?: string | null) {
  if (daysUntil(value) === null) return 'Not set';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value!.slice(0, 10)}T00:00:00Z`));
}

export function deadlineHealth(project: Pick<Project, 'status' | 'endDate'>, now = new Date()) {
  if (project.status === 'COMPLETED') return { label: 'Completed', tone: 'success' } as const;
  const days = daysUntil(project.endDate, now);
  if (days === null) return { label: 'No deadline', tone: 'neutral' } as const;
  if (days < 0) return { label: 'Overdue', tone: 'danger' } as const;
  if (days <= 3) return { label: days === 0 ? 'Due today' : 'Due soon', tone: 'warning' } as const;
  return { label: 'On track', tone: 'info' } as const;
}

export function focusTasks(tasks: Task[], now = new Date()) {
  const rank = (task: Task) => {
    const days = daysUntil(task.dueDate, now);
    if (days !== null && days < 0) return 0;
    if (days === 0) return 1;
    return task.priority === 'HIGH' ? 2 : 3;
  };
  return tasks.filter(task => task.status !== 'COMPLETED' && rank(task) < 3)
    .sort((a, b) => rank(a) - rank(b) || (daysUntil(a.dueDate, now) ?? Infinity) - (daysUntil(b.dueDate, now) ?? Infinity) || a.name.localeCompare(b.name));
}

export function upcomingTasks(tasks: Task[], now = new Date()) {
  return tasks.filter(task => task.status !== 'COMPLETED' && daysUntil(task.dueDate, now) !== null && daysUntil(task.dueDate, now)! >= 0)
    .sort((a, b) => daysUntil(a.dueDate, now)! - daysUntil(b.dueDate, now)! || a.name.localeCompare(b.name));
}
