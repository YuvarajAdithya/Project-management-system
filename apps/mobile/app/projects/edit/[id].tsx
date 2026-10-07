import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import api from '../../../src/lib/api';
import { getApiErrorMessage } from '../../../src/lib/apiError';
import { LoadingScreen } from '../../../src/components/LoadingScreen';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`);
        const p = response.data;
        setName(p.name);
        setDescription(p.description || '');
        setStatus(p.status);
      } catch (error) {
        Alert.alert('Error', getApiErrorMessage(error, 'Failed to fetch project'));
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required');
    try {
      await api.put(`/projects/${id}`, { name: name.trim(), description, status });
      router.back();
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to update project'));
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Project name" />
        
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Description" multiline numberOfLines={4} />
        
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Update Project</Text>
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
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
  chipText: { color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#1D4ED8' },
  button: { backgroundColor: '#3B82F6', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
