import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { getApiErrorMessage } from '../lib/apiError';

const CreateProjectPage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError('End date must not be earlier than start date');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description || undefined,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      await api.post('/projects', payload);
      navigate('/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create project'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div role="alert" className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          
          <div>
            <label className="label-text">Project Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="E.g., Website Redesign" />
          </div>
          
          <div>
            <label className="label-text">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={4} placeholder="Project details..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label-text">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-text">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
