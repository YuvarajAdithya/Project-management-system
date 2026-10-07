import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Project } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { StatusBadge } from '../../src/components/StatusBadge';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  white: '#FFFFFF',
  charcoal: '#2B2B2E',
  text: '#111418',
  muted: '#6E7785',
  lime: '#DFFF37',
  blueSoft: '#E8F2F8',
  blue: '#4E7D98',
  border: 'rgba(120, 140, 160, 0.18)',
};

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
      const response = await api.get('/projects', {
        params: { search, status },
      });

      setProjects(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Failed to load projects. Please try again.'
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [search, status])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProjects();
  }, [search, status]);

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.eyebrow}>SPACE FOR YOUR IDEAS</Text>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Your projects</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityLabel="Create project"
            style={styles.headerAddButton}
            onPress={() => router.push('/projects/create')}
          >
            <Ionicons
              name="add"
              size={22}
              color={COLORS.charcoal}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Keep every project clear, focused and moving forward.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.muted}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            placeholderTextColor="#96A0AE"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
                onPress={() => setStatus(option.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ErrorNotice
        message={errorMessage}
        onRetry={onRefresh}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          projects.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.charcoal]}
            progressBackgroundColor={COLORS.surface}
          />
        }
        ListHeaderComponent={
          projects.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listCount}>
                {projects.length}{' '}
                {projects.length === 1 ? 'project' : 'projects'}
              </Text>

              <Text style={styles.listHint}>
                Tap a project to open it
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          errorMessage ? null : (
            <EmptyState
              iconName="folder-open"
              title="No projects found"
              description={
                search || status
                  ? 'Try changing your search or filter.'
                  : 'Create a project to get started.'
              }
            />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.card}
            onPress={() =>
              router.push(`/projects/${item.id}`)
            }
          >
            <View style={styles.cardTop}>
              <View style={styles.projectIcon}>
                <Ionicons
                  name="folder-outline"
                  size={21}
                  color={COLORS.blue}
                />
              </View>

              <StatusBadge status={item.status} />
            </View>

            <Text style={styles.cardTitle}>
              {item.name}
            </Text>

            {item.description ? (
              <Text
                style={styles.cardDescription}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : (
              <Text style={styles.noDescription}>
                No description added.
              </Text>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.openText}>
                Open project
              </Text>

              <View style={styles.arrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={COLORS.charcoal}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },

  headerArea: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 5,
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerAddButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heading: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 15,
  },

  searchBox: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  filterRow: {
    paddingTop: 12,
    paddingRight: 12,
    gap: 8,
  },

  filterChip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterChipActive: {
    backgroundColor: COLORS.charcoal,
    borderColor: COLORS.charcoal,
  },

  filterText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  filterTextActive: {
    color: COLORS.white,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 105,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  listCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },

  listHint: {
    color: COLORS.muted,
    fontSize: 11,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,

    shadowColor: '#516579',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },

  cardDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  noDescription: {
    color: '#9AA3AE',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  openText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#111418',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,

    elevation: 7,
  },
});
