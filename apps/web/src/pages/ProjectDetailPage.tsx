import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import type { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import DeadlineBadge from '../components/DeadlineBadge';
import ProgressBar from '../components/ProgressBar';
import ProjectTaskList from '../components/ProjectTaskList';
import Icon from '../components/Icon';
import { getApiErrorMessage } from '../lib/apiError';
import { formatDate, taskProgress } from '../lib/projectMetrics';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchProjectData = useCallback(async (signal?: AbortSignal) => {
    setError('');
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        api.get<Project>(`/projects/${id}`, { signal }),
        api.get<Task[]>('/tasks', { params: { projectId: id }, signal }),
      ]);
      if (!signal?.aborted) { setProject(projectResponse.data); setTasks(taskResponse.data); }
    } catch (error) {
      if (!signal?.aborted) setError(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
    } finally { if (!signal?.aborted) setIsLoading(false); }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setProject(null);
    setTasks([]);
    fetchProjectData(controller.signal);
    return () => controller.abort();
  }, [fetchProjectData]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try { await api.delete(`/projects/${id}`); navigate('/projects'); }
    catch (error) {
      setError(getApiErrorMessage(error, 'Failed to delete project. Please try again.'));
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleTaskSave = () => { fetchProjectData(); setShowTaskModal(false); setEditingTask(null); };
  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setBusyTaskId(taskId);
    setError('');
    try { await api.delete(`/tasks/${taskId}`); await fetchProjectData(); }
    catch (error) { setError(getApiErrorMessage(error, 'Failed to delete task. Please try again.')); }
    finally { setBusyTaskId(null); }
  };
  const toggleTaskStatus = async (task: Task) => {
    setBusyTaskId(task.id);
    setError('');
    try { await api.put(`/tasks/${task.id}`, { status: task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }); await fetchProjectData(); }
    catch (error) { setError(getApiErrorMessage(error, 'Failed to update task. Please try again.')); }
    finally { setBusyTaskId(null); }
  };
  const addTask = () => { setEditingTask(null); setShowTaskModal(true); };

  if (isLoading) return <LoadingSpinner />;
  if (!project) return <div><ErrorMessage message={error || 'Project not found'} /><div className="flex gap-3"><Link to="/projects" className="btn-secondary">Back to Projects</Link><button className="btn-primary" onClick={() => fetchProjectData()}>Retry</button></div></div>;
  const progress = taskProgress(tasks);

  return <div>
    <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-secondary hover:text-ink"><Icon name="back" className="h-4 w-4" />Back to Projects</Link>
    <ErrorMessage message={error} />
    <section className="panel mb-8">
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row">
        <div className="min-w-0 w-full flex-1 sm:w-auto"><div className="mb-4 flex flex-wrap items-center gap-3"><span className="icon-tile bg-info-subtle text-info-ink"><Icon name="projects" /></span><StatusBadge status={project.status} /><DeadlineBadge project={project} /></div><h1 className="page-title break-words">{project.name}</h1><p className="mt-4 max-w-3xl whitespace-pre-wrap break-words text-sm leading-7 text-secondary">{project.description || 'No description yet.'}</p></div>
        <div className="flex flex-wrap gap-2"><Link to={`/projects/${id}/edit`} className="btn-secondary"><Icon name="edit" className="h-4 w-4" />Edit</Link><button onClick={() => setShowConfirm(true)} className="btn-danger"><Icon name="trash" className="h-4 w-4" />Delete</button></div>
      </div>
      <div className="mt-7 grid gap-7 border-t border-line pt-6 lg:grid-cols-2">
        <div><div className="mb-3 flex items-center justify-between text-sm"><span className="text-secondary">Project completion</span><span className="font-semibold">{progress.percent}%</span></div><ProgressBar value={progress.percent} label="Project completion" /><p className="mt-3 text-xs text-secondary">{progress.completed} of {progress.total} tasks completed</p></div>
        <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3"><div><dt className="text-secondary">Start date</dt><dd className="mt-2 font-medium">{formatDate(project.startDate)}</dd></div><div><dt className="text-secondary">End date</dt><dd className="mt-2 font-medium">{formatDate(project.endDate)}</dd></div><div><dt className="text-secondary">Created</dt><dd className="mt-2 font-medium">{formatDate(project.createdAt)}</dd></div></dl>
      </div>
    </section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 className="section-title">Project tasks <span className="ml-2 text-sm font-normal text-secondary">{tasks.length}</span></h2><p className="mt-1 text-xs text-secondary">The small steps that bring the big picture to life.</p></div><button onClick={addTask} className="btn-primary"><Icon name="plus" className="h-4 w-4" />Add Task</button></div>
    {tasks.length ? <ProjectTaskList tasks={tasks} busyId={busyTaskId} onToggle={toggleTaskStatus} onEdit={task => { setEditingTask(task); setShowTaskModal(true); }} onDelete={deleteTask} /> : <EmptyState title="Every project starts with a first step" description="Add a task, set a priority, and give your project some momentum." actionText="Add Task" onAction={addTask} />}
    <ConfirmDialog isOpen={showConfirm} title="Delete project?" message="This project and all its tasks will be permanently deleted. This cannot be undone." onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} isProcessing={isDeleting} />
    {showTaskModal && <TaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} onSave={handleTaskSave} task={editingTask} defaultProjectId={id} />}
  </div>;
}
