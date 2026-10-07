import React, { useCallback, useState } from 'react';
import {
  Alert,
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
import { dueDateInput } from '../../src/lib/dueDate';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { Task } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { StatusBadge } from '../../src/components/StatusBadge';
import { PriorityBadge } from '../../src/components/PriorityBadge';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  white: '#FFFFFF',
  charcoal: '#2B2B2E',
  text: '#111418',
  muted: '#6E7785',
  lime: '#DFFF37',
  green: '#8BC49A',
  coral: '#E97A68',
  border: 'rgba(120, 140, 160, 0.18)',
};

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

function getProjectName(task: Task) {
  const extendedTask = task as Task & {
    project?: {
      name?: string;
    };
  };

  return extendedTask.project?.name;
}

function isTaskOverdue(task: Task) {
  if (!task.dueDate || task.status === 'COMPLETED') {
    return false;
  }

  const due = new Date(task.dueDate);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return due.getTime() < today.getTime();
}

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
      const response = await api.get('/tasks', {
        params: {
          search,
          status,
          priority,
        },
      });

      setTasks(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Failed to load tasks. Please try again.'
        )
      );
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
    const newStatus =
      task.status === 'COMPLETED'
        ? 'PENDING'
        : 'COMPLETED';

    try {
      await api.put(`/tasks/${task.id}`, {
        status: newStatus,
      });

      fetchTasks();
    } catch (error) {
      Alert.alert(
        'Error',
        getApiErrorMessage(
          error,
          'Failed to update task status'
        )
      );
    }
  };

  if (loading && !refreshing) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <Text style={styles.eyebrow}>KEEP THINGS MOVING</Text>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Your tasks</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityLabel="Create task"
            style={styles.headerAddButton}
            onPress={() => router.push('/tasks/create')}
          >
            <Ionicons
              name="add"
              size={22}
              color={COLORS.charcoal}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Focus on what needs your attention next.
        </Text>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.muted}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#96A0AE"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={styles.filterLabel}>STATUS</Text>

        <FilterRow
          options={STATUS_OPTIONS}
          selectedValue={status}
          onSelect={setStatus}
        />

        <Text style={styles.filterLabel}>PRIORITY</Text>

        <FilterRow
          options={PRIORITY_OPTIONS}
          selectedValue={priority}
          onSelect={setPriority}
        />
      </View>

      <ErrorNotice
        message={errorMessage}
        onRetry={onRefresh}
      />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.emptyListContent,
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
          tasks.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.taskCount}>
                {tasks.length}{' '}
                {tasks.length === 1 ? 'task' : 'tasks'}
              </Text>

              <Text style={styles.taskHint}>
                Tap to edit
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          errorMessage ? null : (
            <EmptyState
              iconName="checkmark-circle-outline"
              title="No tasks found"
              description={
                search || status || priority
                  ? 'Try changing your current filters.'
                  : "You're all caught up!"
              }
            />
          )
        }
        renderItem={({ item }) => {
          const completed =
            item.status === 'COMPLETED';

          const overdue = isTaskOverdue(item);

          const projectName =
            getProjectName(item);

          return (
            <View
              style={[
                styles.card,
                completed && styles.cardCompleted,
              ]}
            >
              <TouchableOpacity
                accessibilityLabel={
                  completed
                    ? `Mark ${item.name} as pending`
                    : `Mark ${item.name} as completed`
                }
                style={[
                  styles.checkbox,
                  completed && styles.checkboxCompleted,
                ]}
                onPress={() =>
                  toggleTaskStatus(item)
                }
              >
                {completed && (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color={COLORS.white}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.cardBody}
                onPress={() =>
                  router.push(
                    `/tasks/edit/${item.id}`
                  )
                }
              >
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      completed &&
                        styles.cardTitleCompleted,
                    ]}
                  >
                    {item.name}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color="#A1A9B4"
                  />
                </View>

                {projectName ? (
                  <Text style={styles.projectName}>
                    {projectName}
                  </Text>
                ) : null}

                {item.description ? (
                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.badges}>
                  <StatusBadge status={item.status} />
                  <PriorityBadge
                    priority={item.priority}
                  />
                </View>

                <View style={styles.dueRow}>
                  <Ionicons
                    name={
                      overdue
                        ? 'alert-circle-outline'
                        : 'calendar-outline'
                    }
                    size={14}
                    color={
                      overdue
                        ? COLORS.coral
                        : COLORS.muted
                    }
                  />

                  <Text
                    style={[
                      styles.dueDate,
                      overdue && styles.dueDateOverdue,
                    ]}
                  >
                    {item.dueDate
                      ? `${
                          overdue ? 'Overdue · ' : 'Due · '
                        }${dueDateInput(item.dueDate)}`
                      : 'No due date'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />


    </View>
  );
}

function FilterRow({
  options,
  selectedValue,
  onSelect,
}: {
  options: {
    label: string;
    value: string;
  }[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {options.map((option) => {
        const active =
          selectedValue === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.8}
            style={[
              styles.filterChip,
              active && styles.filterChipActive,
            ]}
            onPress={() =>
              onSelect(option.value)
            }
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
    paddingBottom: 5,
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
    marginBottom: 14,
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
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingHorizontal: 10,
  },

  filterLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  filterRow: {
    paddingRight: 12,
    paddingBottom: 11,
    gap: 8,
  },

  filterChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 999,
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
    fontSize: 11,
    fontWeight: '600',
  },

  filterTextActive: {
    color: COLORS.white,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  taskCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },

  taskHint: {
    color: COLORS.muted,
    fontSize: 11,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,

    shadowColor: '#516579',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,

    elevation: 1,
  },

  cardCompleted: {
    opacity: 0.76,
  },

  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#B7C0CB',
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  checkboxCompleted: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  cardBody: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    paddingRight: 7,
  },

  cardTitleCompleted: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },

  projectName: {
    color: '#4E7D98',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },

  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },

  dueDate: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
  },

  dueDateOverdue: {
    color: COLORS.coral,
    fontWeight: '700',
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
