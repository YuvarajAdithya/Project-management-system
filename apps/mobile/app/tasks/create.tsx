import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TaskForm } from '../../src/components/TaskForm';

export default function CreateTaskScreen() {
  const params = useLocalSearchParams<{ projectId?: string | string[] }>();
  const projectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  return <TaskForm initialProjectId={projectId} />;
}
