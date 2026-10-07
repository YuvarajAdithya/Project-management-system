import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import TaskModal from '../components/TaskModal';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks', { params: { search, status, priority } });
      setTasks(res.data);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to load tasks. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority]);

  const toggleTaskStatus = async (task: Task) => {
    setError('');
    try {
      const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Failed to update task. Please try again.'));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setError('');
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
      } catch (e) {
        setError(getApiErrorMessage(e, 'Failed to delete task. Please try again.'));
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        <div className="mt-4 sm:mt-0">
          <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn-primary">
            New Task
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search tasks..."
          className="input-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 && !error ? (
        <EmptyState
          title="No tasks found"
          description="Try adjusting your filters or create a new task."
          actionText="Create Task"
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
                      {task.project && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mr-2">
                          {task.project.name}
                        </span>
                      )}
                      <StatusBadge status={task.priority} />
                      <StatusBadge status={task.status} />
                      {task.dueDate && <span className="text-xs text-gray-500 ml-2">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
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

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={() => { setShowTaskModal(false); fetchTasks(); }}
          task={editingTask}
        />
      )}
    </div>
  );
};

export default TasksPage;
