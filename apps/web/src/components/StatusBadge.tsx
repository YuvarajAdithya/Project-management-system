import React from 'react';
import { ProjectStatus, TaskStatus, TaskPriority } from '../types';

interface StatusBadgeProps {
  status?: ProjectStatus | TaskStatus | TaskPriority;
  text?: string;
}

const getStyles = (status?: string) => {
  switch (status) {
    case 'NOT_STARTED': return 'badge-neutral';
    case 'IN_PROGRESS': return 'badge-info';
    case 'COMPLETED': return 'badge-success';
    case 'PENDING': return 'badge-warning';
    case 'LOW': return 'badge-neutral';
    case 'MEDIUM': return 'badge-warning';
    case 'HIGH': return 'badge-danger';
    default: return 'badge-neutral';
  }
};

const formatText = (text: string) => {
  return text.toLowerCase().replace(/_/g, ' ');
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
  const label = text || (status ? formatText(status) : '');
  return (
    <span className={`badge capitalize ${getStyles(status)}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
