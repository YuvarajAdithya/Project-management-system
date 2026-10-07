import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import type { DashboardStats, Project, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/apiError';
import { completionPercent, focusTasks, upcomingTasks } from '../lib/projectMetrics';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';
import DashboardMetrics from '../components/DashboardMetrics';
import DashboardTaskList from '../components/DashboardTaskList';
import ActiveProjects from '../components/ActiveProjects';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    Promise.allSettled([
      api.get<DashboardStats>('/dashboard', { signal: controller.signal }),
      api.get<Task[]>('/tasks', { signal: controller.signal }),
      api.get<Project[]>('/projects', { signal: controller.signal }),
    ]).then(([statsResult, taskResult, projectResult]) => {
      if (controller.signal.aborted) return;
      setStats(statsResult.status === 'fulfilled' ? statsResult.value.data : null);
      setTasks(taskResult.status === 'fulfilled' ? taskResult.value.data : null);
      setProjects(projectResult.status === 'fulfilled' ? projectResult.value.data : null);
      const failures = [statsResult, taskResult, projectResult].filter(result => result.status === 'rejected');
      setError(failures.map(result => getApiErrorMessage(result.reason, 'Some dashboard data could not be loaded. Please try again.')).filter((message, index, messages) => messages.indexOf(message) === index).join(' '));
      setIsLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const percent = stats ? completionPercent(stats.completedTasks, stats.totalTasks) : 0;
  if (isLoading) return <LoadingSpinner />;

  return <div>
    <PageHeader eyebrow="Your day, at a glance" title={`${greeting}, ${user?.fullName.trim().split(/\s+/)[0] || 'there'}.`} description="A little focus goes a long way. Let’s make today count." action={<Link to="/projects/new" className="btn-primary"><Icon name="plus" className="h-4 w-4" />New Project</Link>} />
    {error && <div className="mb-5"><ErrorMessage message={error} /><button className="btn-secondary" onClick={() => setAttempt(attempt + 1)}>Retry dashboard</button></div>}
    {stats && <DashboardMetrics stats={stats} />}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-6">
        <DashboardTaskList title="Today’s focus" description="Overdue first, then today’s tasks and high priorities." tasks={tasks ? focusTasks(tasks) : null} projects={projects} emptyText="Nothing urgent is waiting. Take a breath, or choose your next task." />
        <ActiveProjects projects={projects} tasks={tasks} />
      </div>
      <div className="min-w-0 space-y-6">
        <section className="panel"><h2 className="section-title">Overall progress</h2><p className="mt-1 text-xs text-secondary">Every finished task moves you forward.</p>
          {stats ? <><div className="relative mx-auto my-6 h-40 w-40"><svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="none" stroke="rgb(var(--color-border))" strokeWidth="8" /><circle cx="60" cy="60" r="50" fill="none" stroke="rgb(var(--color-blue))" strokeWidth="8" strokeLinecap="round" strokeDasharray={Math.PI * 100} strokeDashoffset={Math.PI * 100 * (1 - percent / 100)} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-medium tabular-nums">{percent}%</span><span className="mt-1 text-xs text-secondary">complete</span></div></div><p className="text-center text-sm text-secondary"><strong className="font-semibold text-ink">{stats.completedTasks} of {stats.totalTasks}</strong> tasks completed</p><p className="mt-2 text-center text-xs text-secondary">{stats.totalTasks === 0 ? 'Your next chapter starts with a task.' : 'Small steps. Visible progress.'}</p></> : <p className="py-6 text-sm text-secondary">Progress is unavailable. Please retry.</p>}
        </section>
        <DashboardTaskList compact title="Upcoming deadlines" description="Your nearest unfinished tasks, from today onward." tasks={tasks ? upcomingTasks(tasks) : null} projects={projects} emptyText="No upcoming deadlines. You have room to plan ahead." />
      </div>
    </div>
  </div>;
}