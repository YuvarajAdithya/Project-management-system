import React from 'react';
import { ProjectStatus, TaskStatus, TaskPriority } from '../types';

interface StatusBadgeProps {
  status?: ProjectStatus | TaskStatus | TaskPriority;
  text?: string;
}

const getStyles = (status?: string) => {
  switch (status) {
    case 'NOT_STARTED': return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'LOW': return 'bg-gray-100 text-gray-800';
    case 'MEDIUM': return 'bg-orange-100 text-orange-800';
    case 'HIGH': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatText = (text: string) => {
  return text.replace(/_/g, ' ');
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const label = text || (status ? formatText(status) : '');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStyles(status)}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
