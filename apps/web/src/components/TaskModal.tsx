import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Task, Project } from '../types';
import { getApiErrorMessage } from '../lib/apiError';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  task?: Task | null;
  defaultProjectId?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, task, defaultProjectId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      api.get<Project[]>('/projects')
        .then(res => {
          setProjects(res.data);
          if (!task && !defaultProjectId) {
            setProjectId(current => current || res.data[0]?.id || '');
          }
        })
        .catch(error => setError(getApiErrorMessage(error, 'Failed to load projects. Please try again.')));
      
      if (task) {
        setProjectId(task.projectId);
        setName(task.name);
        setDescription(task.description || '');
        setPriority(task.priority);
        setStatus(task.status);
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      } else {
        setProjectId(defaultProjectId || (projects.length > 0 ? projects[0].id : ''));
        setName('');
        setDescription('');
        setPriority('MEDIUM');
        setStatus('PENDING');
        setDueDate('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !projectId) {
      setError('Name and Project are required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        projectId,
        name: name.trim(),
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      if (task) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      onSave();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save task'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{task ? 'Edit Task' : 'New Task'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div role="alert" className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            
            <div>
              <label className="label-text">Project *</label>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} className="input-field" disabled={!!defaultProjectId && !task}>
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">Task Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="label-text">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3}></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="label-text">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label-text">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
            </div>

            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t border-gray-200 pt-4">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Task'}
              </button>
              <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm" disabled={isSaving}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
