import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import { dueDateInput, parseDueDate } from '../lib/dueDate';
import { Project } from '../types';
import { Action, Choices, enumOptions, Field, FormLoading, FormScreen, Notice } from './TaskoForm';

export function ProjectForm({ id }: { id?: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originalDates, setOriginalDates] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    api.get<Project>(`/projects/${id}`, { signal: controller.signal }).then(({ data }) => {
      if (controller.signal.aborted) return;
      setName(data.name);
      setDescription(data.description || '');
      setStatus(data.status);
      setStartDate(dueDateInput(data.startDate));
      setEndDate(dueDateInput(data.endDate));
      setOriginalDates({ start: data.startDate || null, end: data.endDate || null });
    }).catch(error => {
      if (!controller.signal.aborted) setLoadError(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id, attempt]);

  const submit = async () => {
    if (saving || loading || loadError) return;
    if (!name.trim()) return setError('Project name is required.');
    let start: string | null;
    let end: string | null;
    try {
      // Keep existing timestamps unless the user changes the calendar date.
      start = startDate.trim() === dueDateInput(originalDates.start) ? originalDates.start : parseDueDate(startDate);
      end = endDate.trim() === dueDateInput(originalDates.end) ? originalDates.end : parseDueDate(endDate);
    } catch {
      return setError('Enter valid start and end dates in YYYY-MM-DD format, or leave them empty.');
    }
    if (start && end && Date.parse(end) < Date.parse(start)) return setError('End date must not be earlier than start date.');
    setError(null);
    setSaving(true);
    try {
      const body = { name: name.trim(), description, status, startDate: start, endDate: end };
      if (id) await api.put(`/projects/${id}`, body);
      else await api.post('/projects', body);
      router.back();
    } catch (error) {
      setError(getApiErrorMessage(error, `Failed to ${id ? 'update' : 'create'} project.`));
    } finally { setSaving(false); }
  };

  if (loading) return <FormLoading />;
  return <FormScreen title={id ? 'Edit project' : 'A new beginning.'} subtitle={id ? 'Keep your project details and next steps up to date.' : 'Give your next idea a name and a little direction.'}>
    {loadError ? <Notice message={loadError} onRetry={() => setAttempt(value => value + 1)} /> : <>
      <Field label="Project name *" value={name} onChangeText={setName} editable={!saving} placeholder="What are you working on?" autoCapitalize="sentences" />
      <Field label="Description" value={description} onChangeText={setDescription} editable={!saving} placeholder="A little context for your project" multiline />
      <Choices label="Status" options={enumOptions(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])} value={status} onChange={setStatus} disabled={saving} />
      <Field label="Start date (optional)" value={startDate} onChangeText={setStartDate} editable={!saving} placeholder="YYYY-MM-DD" autoCapitalize="none" autoCorrect={false} maxLength={10} hint="Leave empty for no start date." />
      <Field label="End date (optional)" value={endDate} onChangeText={setEndDate} editable={!saving} placeholder="YYYY-MM-DD" autoCapitalize="none" autoCorrect={false} maxLength={10} hint="Leave empty for no end date." />
      <Notice message={error} />
      <Action label={id ? 'Save changes' : 'Create project'} busy={saving} onPress={submit} />
    </>}
    <Action label="Cancel" secondary disabled={saving} onPress={() => router.back()} />
  </FormScreen>;
}
