import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
      } catch (error) {
        setError(getApiErrorMessage(error, 'Failed to load dashboard. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <ErrorMessage message={error} />
      {stats && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalProjects || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Projects In Progress</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats?.projectsInProgress || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.totalTasks || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats?.pendingTasks || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats?.completedTasks || 0}</p>
        </div>
      </div>}
    </div>
  );
};

export default DashboardPage;
