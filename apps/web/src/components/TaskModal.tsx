import DialogFrame from './DialogFrame';
import ErrorMessage from './ErrorMessage';
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
    <DialogFrame open={isOpen} title={task ? 'Edit task' : 'New task'} onClose={onClose} busy={isSaving}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorMessage message={error} />
        <div><label htmlFor="task-project" className="label-text">Project *</label><select id="task-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="input-field" disabled={!!defaultProjectId && !task}><option value="">Select Project</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
        <div><label htmlFor="task-name" className="label-text">Task name *</label><input id="task-name" type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="What needs to get done?" /></div>
        <div><label htmlFor="task-description" className="label-text">Description</label><textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={3} placeholder="Add a little context..." /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="task-priority" className="label-text">Priority</label><select id="task-priority" value={priority} onChange={e => setPriority(e.target.value)} className="input-field"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div><div><label htmlFor="task-status" className="label-text">Status</label><select id="task-status" value={status} onChange={e => setStatus(e.target.value)} className="input-field"><option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></div></div>
        <div><label htmlFor="task-due" className="label-text">Due date</label><input id="task-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" /></div>
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>Cancel</button><button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Task'}</button></div>
      </form>
    </DialogFrame>
  );
};

export default TaskModal;