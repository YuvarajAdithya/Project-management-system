import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import type { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import PageHeader from '../components/PageHeader';
import ProjectCard from '../components/ProjectCard';
import Icon from '../components/Icon';
import { getApiErrorMessage } from '../lib/apiError';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskError, setTaskError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setTaskError('');
    api.get<Task[]>('/tasks', { signal: controller.signal }).then(res => setTasks(res.data)).catch(error => {
      if (!controller.signal.aborted) { setTasks(null); setTaskError(getApiErrorMessage(error, 'Task progress could not be loaded.')); }
    });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.get<Project[]>('/projects', { params: { search, status }, signal: controller.signal });
        if (!controller.signal.aborted) setProjects(res.data);
      } catch (error) {
        if (!controller.signal.aborted) { setProjects([]); setError(getApiErrorMessage(error, 'Failed to load projects. Please try again.')); }
      } finally { if (!controller.signal.aborted) setIsLoading(false); }
    }, 300);
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, [search, status, attempt]);

  return <div>
    <PageHeader eyebrow="Space for your ideas" title="Projects" description="From the first step to the finishing touch. Keep it all together." action={<Link to="/projects/new" className="btn-primary"><Icon name="plus" className="h-4 w-4" />New Project</Link>} />
    <div className="filter-bar">
      <div className="search-field"><Icon name="search" /><label htmlFor="project-search" className="sr-only">Search projects</label><input id="project-search" type="search" className="input-field" placeholder="Find a project..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="flex w-full items-center gap-3 sm:w-auto"><label htmlFor="project-status" className="shrink-0 text-xs font-medium text-secondary">Status</label><select id="project-status" className="input-field mt-0 min-w-40" value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option><option value="NOT_STARTED">Not started</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></div>
      {(search || status) && <button className="text-xs font-semibold text-info-ink hover:underline" onClick={() => { setSearch(''); setStatus(''); }}>Clear filters</button>}
    </div>
    {(error || taskError) && <div className="mb-6"><ErrorMessage message={error || taskError} /><button className="btn-secondary" onClick={() => setAttempt(attempt + 1)}>Retry</button></div>}
    {isLoading ? <LoadingSpinner /> : !error && <><div className="mb-4 flex items-center justify-between"><p className="text-xs text-secondary" role="status">{projects.length} {projects.length === 1 ? 'project' : 'projects'}{search || status ? ' found' : ' in your workspace'}</p><span className="hidden text-xs text-secondary sm:inline">A clear view of what’s moving forward</span></div>
      {projects.length === 0 ? <EmptyState title={search || status ? 'No projects match just yet' : 'Make space for something new'} description={search || status ? 'Try another name or clear your filters.' : 'Start your first project and turn your next idea into a plan.'} /> : <div className="grid auto-rows-fr gap-5 lg:grid-cols-2 2xl:grid-cols-3">{projects.map(project => <ProjectCard key={project.id} project={project} tasks={tasks} />)}</div>}
    </>}
  </div>;
}
