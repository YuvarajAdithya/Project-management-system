import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { dueDateInput } from '../../src/lib/dueDate';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Task } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { StatusBadge } from '../../src/components/StatusBadge';
import { PriorityBadge } from '../../src/components/PriorityBadge';
import { FilterChips } from '../../src/components/FilterChips';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const PRIORITY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks', { params: { search, status, priority } });
      setTasks(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load tasks. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [search, status, priority])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [search, status, priority]);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, 'Failed to update task status'));
    }
  };

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FilterChips options={STATUS_OPTIONS} selectedValue={status} onSelect={setStatus} />
        <View style={styles.filterSpacer} />
        <FilterChips options={PRIORITY_OPTIONS} selectedValue={priority} onSelect={setPriority} />
      </View>
      
      <ErrorNotice message={errorMessage} onRetry={onRefresh} />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={errorMessage ? null : <EmptyState iconName="checkmark-circle-outline" title="No tasks found" description="You're all caught up!" />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/tasks/edit/${item.id}`)}>
            <TouchableOpacity onPress={() => toggleTaskStatus(item)} style={styles.checkbox}>
              <Ionicons 
                name={item.status === 'COMPLETED' ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={item.status === 'COMPLETED' ? "#10B981" : "#9CA3AF"} 
              />
            </TouchableOpacity>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, item.status === 'COMPLETED' && styles.cardTitleCompleted]}>{item.name}</Text>
              {item.dueDate && <Text style={styles.dueDate}>Due: {dueDateInput(item.dueDate)}</Text>}
              <View style={styles.badges}>
                <StatusBadge status={item.status} />
                <View style={{ width: 8 }} />
                <PriorityBadge priority={item.priority} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/tasks/create')}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#fff', paddingBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', marginHorizontal: 16, marginTop: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 },
  filterSpacer: { height: 8 },
  listContent: { padding: 16, paddingBottom: 80 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  checkbox: { marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#1F2937', marginBottom: 8 },
  cardTitleCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  dueDate: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  badges: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#3B82F6', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
});
