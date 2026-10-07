import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { dueDateInput } from '../../src/lib/dueDate';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Project, Task } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { StatusBadge } from '../../src/components/StatusBadge';
import { PriorityBadge } from '../../src/components/PriorityBadge';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks', { params: { projectId: id } })
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [id]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Project', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await api.delete(`/projects/${id}`);
            router.back();
          } catch (error) {
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete project'));
          }
        } 
      },
    ]);
  };

  if (loading && !refreshing) return <LoadingScreen />;
  if (!project) return <View style={styles.container}><ErrorNotice message={errorMessage || 'Project not found.'} onRetry={onRefresh} /></View>;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: project.name,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => router.push(`/projects/edit/${id}`)}>
                <Ionicons name="pencil" size={24} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )
        }} 
      />
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ErrorNotice message={errorMessage} onRetry={onRefresh} />
        <View style={styles.infoSection}>
          <StatusBadge status={project.status} />
          {project.description ? <Text style={styles.description}>{project.description}</Text> : null}
          <View style={styles.dates}>
            {project.startDate && <Text style={styles.dateText}>Start: {new Date(project.startDate).toLocaleDateString()}</Text>}
            {project.endDate && <Text style={styles.dateText}>End: {new Date(project.endDate).toLocaleDateString()}</Text>}
          </View>
        </View>

        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <TouchableOpacity style={styles.addTaskButton} onPress={() => router.push({ pathname: '/tasks/create', params: { projectId: id } })}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>
          
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks yet.</Text>
          ) : (
            tasks.map(task => (
              <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => router.push(`/tasks/edit/${task.id}`)}>
                <View style={styles.taskBody}>
                  <Text style={[styles.taskTitle, task.status === 'COMPLETED' && styles.taskTitleCompleted]}>{task.name}</Text>
                  {task.dueDate && <Text style={styles.dueDate}>Due: {dueDateInput(task.dueDate)}</Text>}
                  <View style={styles.badges}>
                    <StatusBadge status={task.status} />
                    <View style={{ width: 8 }} />
                    <PriorityBadge priority={task.priority} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  infoSection: { backgroundColor: '#fff', padding: 16, marginBottom: 16 },
  description: { fontSize: 16, color: '#4B5563', marginTop: 12 },
  dates: { flexDirection: 'row', gap: 16, marginTop: 16 },
  dateText: { fontSize: 14, color: '#6B7280' },
  tasksSection: { padding: 16 },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  addTaskButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  addTaskText: { color: '#fff', fontWeight: '500', marginLeft: 4 },
  emptyText: { color: '#6B7280', textAlign: 'center', marginTop: 20 },
  taskCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '500', color: '#1F2937', marginBottom: 8 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  dueDate: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  badges: { flexDirection: 'row', alignItems: 'center' },
});
