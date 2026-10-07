import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const res = await api.get(`/projects/${id}`);
        const p = res.data;
        setName(p.name);
        setDescription(p.description || '');
        setStatus(p.status);
        setStartDate(p.startDate ? p.startDate.split('T')[0] : '');
        setEndDate(p.endDate ? p.endDate.split('T')[0] : '');
      } catch (error) {
        setLoadError(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

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
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      };
      await api.put(`/projects/${id}`, payload);
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update project'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (loadError) return (
    <div>
      <ErrorMessage message={loadError} />
      <button onClick={() => navigate('/projects')} className="btn-secondary">Back to Projects</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div role="alert" className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
          
          <div>
            <label className="label-text">Project Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          
          <div>
            <label className="label-text">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={4}></textarea>
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
            <button type="button" onClick={() => navigate(`/projects/${id}`)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
