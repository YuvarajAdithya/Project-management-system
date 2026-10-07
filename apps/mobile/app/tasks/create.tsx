import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { parseDueDate } from '../../src/lib/dueDate';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Project } from '../../src/types';

export default function CreateTaskScreen() {
  const params = useLocalSearchParams();
  const initialProjectId = Array.isArray(params.projectId) ? params.projectId[0] : params.projectId;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
      setProjectsError(null);
    } catch (error) {
      setProjectsError(getApiErrorMessage(error, 'Failed to load projects. Please try again.'));
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProjects();
  }, []);

  const handleSubmit = async () => {
    if (saving || projectsLoading) return;
    if (!name.trim() || !projectId || !projects.some(project => project.id === projectId)) {
      return Alert.alert('Error', 'A name and an available project are required');
    }
    let parsedDueDate: string | null;
    try {
      parsedDueDate = parseDueDate(dueDate);
    } catch {
      return Alert.alert('Error', 'Enter a valid due date in YYYY-MM-DD format.');
    }
    setSaving(true);
    try {
      await api.post('/tasks', { projectId, name: name.trim(), description, priority, status: 'PENDING', dueDate: parsedDueDate });
      router.back();
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to create task'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Project</Text>
        <ErrorNotice message={projectsError} onRetry={fetchProjects} />
        {projectsLoading && <ActivityIndicator color="#3B82F6" />}
        {!projectsLoading && !projectsError && projects.length === 0 && <Text>Create a project before adding a task.</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
          {projects.map((p) => (
            <TouchableOpacity key={p.id} style={[styles.chip, projectId === p.id && styles.chipActive]} onPress={() => setProjectId(p.id)}>
              <Text style={[styles.chipText, projectId === p.id && styles.chipTextActive]}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Task name" />
        
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description" multiline numberOfLines={4} />

        <Text style={styles.label}>Due Date (optional)</Text>
        <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" autoCapitalize="none" maxLength={10} />
        <Text style={styles.hint}>Leave empty for no due date.</Text>
        
        <Text style={styles.label}>Priority</Text>
        <View style={styles.pickerContainer}>
          {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
            <TouchableOpacity key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving || projectsLoading || !!projectsError || projects.length === 0}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Task</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20, gap: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: -8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  hint: { fontSize: 12, color: '#6B7280', marginTop: -8 },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  chipText: { color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#1D4ED8' },
  button: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
