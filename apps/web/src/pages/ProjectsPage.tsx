import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Project } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.get('/projects', { params: { search, status } });
        setProjects(res.data);
      } catch (error) {
        setError(getApiErrorMessage(error, 'Failed to load projects. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };
    const timeoutId = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timeoutId);
  }, [search, status]);

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <div className="mt-4 sm:mt-0">
          <Link to="/projects/new" className="btn-primary">
            New Project
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search projects..."
          className="input-field max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field max-w-xs"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {isLoading ? (
        <LoadingSpinner />
      ) : projects.length === 0 && !error ? (
        <EmptyState
          title="No projects found"
          description="Get started by creating a new project."
          actionText="Create Project"
          onAction={() => navigate('/projects/new')}
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900 truncate pr-2">{project.name}</h3>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                {project.description || 'No description provided.'}
              </p>
              <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                {project.endDate && (
                  <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
