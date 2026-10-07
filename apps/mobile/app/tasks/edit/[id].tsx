import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../../src/lib/api';
import { getApiErrorMessage } from '../../../src/lib/apiError';
import { dueDateInput, parseDueDate } from '../../../src/lib/dueDate';
import { Task } from '../../../src/types';
import { LoadingScreen } from '../../../src/components/LoadingScreen';

export default function EditTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [originalDueDate, setOriginalDueDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get<Task>(`/tasks/${id}`);
        const t = response.data;
        setName(t.name);
        setDescription(t.description || '');
        setPriority(t.priority);
        setStatus(t.status);
        setDueDate(dueDateInput(t.dueDate));
        setOriginalDueDate(t.dueDate || null);
      } catch (error) {
        Alert.alert('Error', getApiErrorMessage(error, 'Failed to fetch task'));
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleSubmit = async () => {
    if (saving) return;
    if (!name.trim()) return Alert.alert('Error', 'Name is required');
    let parsedDueDate: string | null;
    try {
      // Preserve an existing datetime when only other task fields were changed.
      parsedDueDate = dueDate.trim() === dueDateInput(originalDueDate) ? originalDueDate : parseDueDate(dueDate);
    } catch {
      return Alert.alert('Error', 'Enter a valid due date in YYYY-MM-DD format.');
    }
    setSaving(true);
    try {
      await api.put(`/tasks/${id}`, { name: name.trim(), description, priority, status, dueDate: parsedDueDate });
      router.back();
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to update task'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/tasks/${id}`);
          router.back();
        } catch (error) {
          Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete task'));
        }
      }}
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Task name" />
        
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description" multiline numberOfLines={4} />

        <Text style={styles.label}>Due Date (optional)</Text>
        <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" autoCapitalize="none" maxLength={10} />
        <Text style={styles.hint}>Leave empty to remove the due date.</Text>
        
        <Text style={styles.label}>Priority</Text>
        <View style={styles.pickerContainer}>
          {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
            <TouchableOpacity key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Update Task'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete} disabled={saving}>
          <Text style={styles.deleteButtonText}>Delete Task</Text>
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
  deleteButton: { backgroundColor: '#FEE2E2', marginTop: 8 },
  deleteButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
});
