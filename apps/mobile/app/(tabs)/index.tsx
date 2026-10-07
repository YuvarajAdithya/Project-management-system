import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { DashboardStats } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to load dashboard. Please try again.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchStats();
  }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>
      <ErrorNotice message={errorMessage} onRetry={onRefresh} />
      {stats && <View style={styles.grid}>
        <StatCard title="Total Projects" value={stats?.totalProjects} icon="folder" color="#3B82F6" />
        <StatCard title="Projects In Progress" value={stats?.projectsInProgress} icon="play" color="#8B5CF6" />
        <StatCard title="Total Tasks" value={stats?.totalTasks} icon="list" color="#6366F1" />
        <StatCard title="Pending Tasks" value={stats?.pendingTasks} icon="time" color="#F59E0B" />
        <StatCard title="Completed Tasks" value={stats?.completedTasks} icon="checkmark-circle" color="#10B981" />
      </View>}
    </ScrollView>
  );
}

const StatCard = ({ title, value, icon, color }: { title: string, value?: number, icon: any, color: string }) => (
  <View style={styles.card}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value || 0}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  grid: { padding: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    backgroundColor: '#fff', 
    width: '48%', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
});
