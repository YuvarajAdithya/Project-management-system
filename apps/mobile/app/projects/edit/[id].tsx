import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProjectForm } from '../../../src/components/ProjectForm';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProjectForm key={id} id={id} />;
}
