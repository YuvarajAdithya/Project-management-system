import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Project, Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchProjectData = async () => {
    setError('');
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks', { params: { projectId: id } })
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to delete project. Please try again.'));
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleTaskSave = () => {
    fetchProjectData();
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setError('');
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchProjectData();
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to delete task. Please try again.'));
      }
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    setError('');
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchProjectData();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to update task. Please try again.'));
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!project) return (
    <div>
      <ErrorMessage message={error || 'Project not found'} />
      <Link to="/projects" className="btn-secondary">Back to Projects</Link>
    </div>
  );

  return (
    <div>
      <ErrorMessage message={error} />
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <div className="flex space-x-3 text-sm text-gray-500">
              <StatusBadge status={project.status} />
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link to={`/projects/${id}/edit`} className="btn-secondary">Edit</Link>
            <button onClick={() => setShowConfirm(true)} className="btn-danger">Delete</button>
          </div>
        </div>
        <div className="prose max-w-none text-gray-700">
          <p>{project.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Tasks</h2>
        <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn-primary">
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create tasks to track progress on this project."
          actionText="Add Task"
          onAction={() => { setEditingTask(null); setShowTaskModal(true); }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {tasks.map(task => (
              <li key={task.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => toggleTaskStatus(task)}
                    className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <StatusBadge status={task.priority} />
                      {task.dueDate && <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => { setEditingTask(task); setShowTaskModal(true); }} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated tasks will be permanently deleted."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        isProcessing={isDeleting}
      />

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={handleTaskSave}
          task={editingTask}
          defaultProjectId={id}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
