import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useFocusEffect, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { dueDateInput } from '../../src/lib/dueDate';
import { Project, Task } from '../../src/types';
import { Action, Badge, colors, FormLoading, Notice } from '../../src/components/TaskoForm';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get<Project>(`/projects/${id}`, { signal }),
        api.get<Task[]>('/tasks', { params: { projectId: id }, signal }),
      ]);
      if (signal?.aborted) return;
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setErrorMessage(null);
    } catch (error) {
      if (!signal?.aborted) setErrorMessage(getApiErrorMessage(error, 'Failed to load project. Please try again.'));
    } finally {
      if (!signal?.aborted) { setLoading(false); setRefreshing(false); }
    }
  }, [id]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    void fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]));

  const onRefresh = () => { setRefreshing(true); void fetchData(); };
  const handleDelete = () => {
    if (deleting) return;
    Alert.alert('Delete project?', 'This project and all its tasks will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeleting(true);
        try { await api.delete(`/projects/${id}`); router.back(); }
        catch (error) { setErrorMessage(getApiErrorMessage(error, 'Failed to delete project.')); }
        finally { setDeleting(false); }
      } },
    ]);
  };

  if (loading) return <FormLoading />;
  if (!project) return <View style={[styles.container, styles.content]}><Notice message={errorMessage || 'Project not found.'} onRetry={onRefresh} /></View>;
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  return <>
    <Stack.Screen options={{ title: 'Project details', headerRight: () => <View style={styles.headerActions}>
      <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Edit project" disabled={deleting} onPress={() => router.push(`/projects/edit/${id}`)}><Ionicons name="create-outline" size={22} color={colors.charcoal} /></TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Delete project" accessibilityState={{ disabled: deleting, busy: deleting }} disabled={deleting} onPress={handleDelete}><Ionicons name="trash-outline" size={22} color="#9F3E2E" /></TouchableOpacity>
    </View> }} />
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 24, paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.charcoal} colors={[colors.charcoal]} />}>
      <View style={styles.inner}>
        <Notice message={errorMessage} onRetry={onRefresh} />
        <View style={styles.info}>
          <View style={styles.heroIcon}><Ionicons name="folder-open-outline" size={25} color={colors.charcoal} /></View>
          <Text style={styles.eyebrow}>PROJECT OVERVIEW</Text>
          <Text accessibilityRole="header" style={styles.title}>{project.name}</Text>
          <Badge value={project.status} />
          <Text style={styles.description}>{project.description || 'No description yet.'}</Text>
          <View style={styles.dates}>
            <View style={styles.date}><Text style={styles.meta}>Start date</Text><Text style={styles.dateText}>{dueDateInput(project.startDate) || 'Not set'}</Text></View>
            <View style={styles.date}><Text style={styles.meta}>End date</Text><Text style={styles.dateText}>{dueDateInput(project.endDate) || 'Not set'}</Text></View>
          </View>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressHeading}><Text style={styles.progressLabel}>Project completion</Text><Text style={styles.percent}>{percent}%</Text></View>
          <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Project completion" accessibilityValue={{ min: 0, max: 100, now: percent }}><View style={[styles.fill, { width: `${percent}%` }]} /></View>
          <Text style={styles.progressCaption}>{completed} of {tasks.length} tasks completed</Text>
        </View>
        <View style={styles.tasksHeader}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Project tasks · {tasks.length}</Text>
          <Action label="Add task" disabled={deleting} onPress={() => router.push({ pathname: '/tasks/create', params: { projectId: id } })} />
        </View>
        {tasks.length === 0 ? <View style={styles.empty}><Ionicons name="checkbox-outline" size={30} color={colors.secondary} /><Text style={styles.emptyTitle}>A little progress starts here.</Text><Text style={styles.meta}>Add the first task to your project.</Text></View> : tasks.map(task => <TouchableOpacity key={task.id} accessibilityRole="button" accessibilityLabel={`Edit task: ${task.name}`} disabled={deleting} style={styles.taskCard} onPress={() => router.push(`/tasks/edit/${task.id}`)}>
          <View style={styles.taskHeading}><Ionicons name={task.status === 'COMPLETED' ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={task.status === 'COMPLETED' ? '#2E673F' : colors.secondary} /><Text style={[styles.taskTitle, task.status === 'COMPLETED' && styles.completed]}>{task.name}</Text><Ionicons name="chevron-forward" size={18} color={colors.secondary} /></View>
          {task.dueDate && <Text style={styles.meta}>Due {dueDateInput(task.dueDate)}</Text>}
          <View style={styles.badges}><Badge value={task.status} /><Badge value={task.priority} /></View>
        </TouchableOpacity>)}
      </View>
    </ScrollView>
  </>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas }, content: { padding: 20 }, inner: { width: '100%', maxWidth: 740, alignSelf: 'center', gap: 18 },
  headerActions: { flexDirection: 'row', gap: 2 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  info: { padding: 22, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#FFFFFF', gap: 14 },
  heroIcon: { width: 48, height: 48, backgroundColor: '#E7F1F8', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: colors.secondary, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  description: { color: colors.secondary, fontSize: 15, lineHeight: 24 },
  dates: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, borderTopWidth: 1, borderColor: colors.border, paddingTop: 18, marginTop: 4 },
  date: { flexGrow: 1, gap: 6 }, meta: { color: colors.secondary, fontSize: 13, lineHeight: 20 }, dateText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  progressCard: { borderRadius: 22, backgroundColor: colors.charcoal, padding: 22, gap: 14 },
  progressHeading: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }, progressLabel: { color: '#FFFFFF', fontSize: 15 }, percent: { color: colors.lime, fontWeight: '700', fontSize: 20 },
  track: { height: 7, backgroundColor: '#53545A', borderRadius: 4, overflow: 'hidden' }, fill: { height: '100%', backgroundColor: colors.lime, borderRadius: 4 }, progressCaption: { color: '#D7E1EB', fontSize: 13 },
  tasksHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 10 }, sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '700' },
  taskCard: { padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#FFFFFF', gap: 12 },
  taskHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, taskTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 23 }, completed: { textDecorationLine: 'line-through', color: colors.secondary }, badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  empty: { alignItems: 'center', padding: 26, gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#AEBDCD', borderRadius: 22 }, emptyTitle: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
