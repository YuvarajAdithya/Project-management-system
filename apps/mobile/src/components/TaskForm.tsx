import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { router } from 'expo-router';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { dueDateInput, parseDueDate } from '../lib/dueDate';
import { Project, Task } from '../types';
import { Action, Choices, colors, enumOptions, Field, FormLoading, FormScreen, Notice } from './TaskoForm';

export function TaskForm({ id, initialProjectId }: { id?: string; initialProjectId?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [originalProjectId, setOriginalProjectId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [originalDueDate, setOriginalDueDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [projectsAttempt, setProjectsAttempt] = useState(0);
  const busy = saving || deleting;

  useEffect(() => {
    const controller = new AbortController();
    setProjectsLoading(true);
    setProjectsError(null);
    api.get<Project[]>('/projects', { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setProjects(data);
    }).catch(error => {
      if (!controller.signal.aborted) setProjectsError(getApiErrorMessage(error, 'Failed to load projects. Please try again.'));
    }).finally(() => { if (!controller.signal.aborted) setProjectsLoading(false); });
    return () => controller.abort();
  }, [projectsAttempt]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    api.get<Task>(`/tasks/${id}`, { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setName(data.name);
      setDescription(data.description || '');
      setProjectId(data.projectId);
      setOriginalProjectId(data.projectId);
      setPriority(data.priority);
      setStatus(data.status);
      setDueDate(dueDateInput(data.dueDate));
      setOriginalDueDate(data.dueDate || null);
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(getApiErrorMessage(error, 'Failed to load task. Please try again.'));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, attempt]);

  const submit = async () => {
    if (busy || loading || loadError) return;
    if (!name.trim()) return setError('Task name is required.');
    // A projects-list failure must not prevent editing a task in its current project.
    const projectChanged = !id || projectId !== originalProjectId;
    if (projectChanged && (projectsLoading || projectsError || !projects.some(project => project.id === projectId))) {
      return setError('Choose an available project before saving.');
    }
    let parsedDueDate: string | null;
    try {
      parsedDueDate = dueDate.trim() === dueDateInput(originalDueDate) ? originalDueDate : parseDueDate(dueDate);
    } catch { return setError('Enter a valid due date in YYYY-MM-DD format.'); }
    setSaving(true);
    setError(null);
    try {
      const body = { name: name.trim(), description, priority, status, dueDate: parsedDueDate, ...(projectChanged ? { projectId } : {}) };
      if (id) await api.put(`/tasks/${id}`, body);
      else await api.post('/tasks', body);
      router.back();
    } catch (error) {
      setError(getApiErrorMessage(error, `Failed to ${id ? 'update' : 'create'} task.`));
    } finally { setSaving(false); }
  };

  const remove = () => {
    if (busy) return;
    Alert.alert('Delete task?', 'This task will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeleting(true);
        setError(null);
        try { await api.delete(`/tasks/${id}`); router.back(); }
        catch (error) { setError(getApiErrorMessage(error, 'Failed to delete task.')); }
        finally { setDeleting(false); }
      } },
    ]);
  };

  if (loading) return <FormLoading />;
  return <FormScreen title={id ? 'Edit task' : 'One step forward.'} subtitle={id ? 'Adjust the details and keep your work moving.' : 'Make your next step clear, focused and achievable.'}>
    {loadError ? <Notice message={loadError} onRetry={() => setAttempt(value => value + 1)} /> : <>
      <Notice message={projectsError} onRetry={() => setProjectsAttempt(value => value + 1)} />
      {projectsLoading && <Text style={{ color: colors.secondary }} accessibilityLiveRegion="polite">Loading projects…</Text>}
      {!projectsLoading && !projectsError && projects.length === 0 && <Text style={{ color: colors.secondary }}>Create a project before adding a task.</Text>}
      {!!id && (projectsError || projectsLoading) && <Text style={{ color: colors.secondary }}>Your current project will be kept unless you choose another one.</Text>}
      <Choices label="Project *" options={projects.map(project => ({ value: project.id, label: project.name }))} value={projectId} onChange={setProjectId} disabled={busy || projectsLoading || !!projectsError} />
      <Field label="Task name *" value={name} onChangeText={setName} editable={!busy} placeholder="What needs to happen?" autoCapitalize="sentences" />
      <Field label="Description" value={description} onChangeText={setDescription} editable={!busy} placeholder="Add any useful details" multiline />
      <Choices label="Priority" options={enumOptions(['LOW', 'MEDIUM', 'HIGH'])} value={priority} onChange={setPriority} disabled={busy} />
      <Choices label="Status" options={enumOptions(['PENDING', 'IN_PROGRESS', 'COMPLETED'])} value={status} onChange={setStatus} disabled={busy} />
      <Field label="Due date (optional)" value={dueDate} onChangeText={setDueDate} editable={!busy} placeholder="YYYY-MM-DD" autoCapitalize="none" autoCorrect={false} maxLength={10} hint="Leave empty for no due date." />
      <Notice message={error} />
      <Action label={id ? 'Save changes' : 'Create task'} onPress={submit} busy={saving} disabled={deleting || (!id && (projectsLoading || !!projectsError || projects.length === 0))} />
      {id && <Action label="Delete task" onPress={remove} destructive busy={deleting} disabled={saving} />}
    </>}
    <Action label="Cancel" secondary disabled={busy} onPress={() => router.back()} />
  </FormScreen>;
}
