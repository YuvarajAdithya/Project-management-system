import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TaskForm } from '../../../src/components/TaskForm';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TaskForm key={id} id={id} />;
}
