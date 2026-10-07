import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Project } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { StatusBadge } from '../../src/components/StatusBadge';
import { FilterChips } from '../../src/components/FilterChips';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Not Started', value: 'NOT_STARTED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects', { params: { search, status } });
      setProjects(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load projects. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchProjects();
  }, [search, status]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [search, status]);

  if (loading && !refreshing) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <FilterChips options={STATUS_OPTIONS} selectedValue={status} onSelect={setStatus} />
      </View>
      
      <ErrorNotice message={errorMessage} onRetry={onRefresh} />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={errorMessage ? null : <EmptyState iconName="folder-open" title="No projects found" description="Create a project to get started." />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/projects/${item.id}`)}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <StatusBadge status={item.status} />
            </View>
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/projects/create')}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#fff', paddingBottom: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16 },
  listContent: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1, marginRight: 8 },
  cardDescription: { fontSize: 14, color: '#6B7280' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#3B82F6', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
});
