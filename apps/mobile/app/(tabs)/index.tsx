import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import api from '../../src/lib/api';
import { getApiErrorMessage } from '../../src/lib/apiError';
import { ErrorNotice } from '../../src/components/ErrorNotice';
import { DashboardStats } from '../../src/types';
import { LoadingScreen } from '../../src/components/LoadingScreen';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  white: '#FFFFFF',
  charcoal: '#2B2B2E',
  text: '#111418',
  muted: '#6E7785',
  lime: '#DFFF37',
  border: 'rgba(120, 140, 160, 0.18)',
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard');

      setStats(response.data);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          'Failed to load dashboard. Please try again.'
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const progress = useMemo(() => {
    if (!stats || stats.totalTasks === 0) {
      return 0;
    }

    return Math.round(
      (stats.completedTasks / stats.totalTasks) * 100
    );
  }, [stats]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.charcoal}
          colors={[COLORS.charcoal]}
          progressBackgroundColor={COLORS.surface}
        />
      }
    >
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>YOUR DAY, AT A GLANCE</Text>

        <Text style={styles.title}>Overview</Text>

        <Text style={styles.subtitle}>
          Keep your projects moving, one clear step at a time.
        </Text>
      </View>

      <ErrorNotice
        message={errorMessage}
        onRetry={onRefresh}
      />

      {stats && (
        <>
          <View style={styles.progressCard}>
            <View style={styles.progressTopRow}>
              <View style={styles.progressTextBlock}>
                <Text style={styles.darkEyebrow}>
                  OVERALL PROGRESS
                </Text>

                <Text style={styles.progressTitle}>
                  {progress}% complete
                </Text>

                <Text style={styles.progressSubtitle}>
                  {stats.completedTasks} of {stats.totalTasks} tasks finished
                </Text>
              </View>

              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeValue}>
                  {progress}%
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.grid}>
            <MetricCard
              title="Projects"
              value={stats.totalProjects}
              icon="folder-outline"
              iconBackground="#E8F2F8"
              iconColor="#4E7D98"
            />

            <MetricCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon="list-outline"
              iconBackground="#EEF0F7"
              iconColor="#65728A"
            />

            <MetricCard
              title="Pending"
              value={stats.pendingTasks}
              icon="time-outline"
              iconBackground="#FFF3DA"
              iconColor="#A87719"
            />

            <MetricCard
              title="Completed"
              value={stats.completedTasks}
              icon="checkmark-outline"
              iconBackground="#E6F3E9"
              iconColor="#4D805A"
            />
          </View>

          <View style={styles.inProgressCard}>
            <View style={styles.inProgressIcon}>
              <Ionicons
                name="pulse-outline"
                size={21}
                color={COLORS.charcoal}
              />
            </View>

            <View style={styles.inProgressText}>
              <Text style={styles.inProgressLabel}>
                Projects in progress
              </Text>

              <Text style={styles.inProgressHint}>
                Work that is currently moving forward.
              </Text>
            </View>

            <View style={styles.inProgressValueContainer}>
              <Text style={styles.inProgressValue}>
                {stats.projectsInProgress}
              </Text>
            </View>
          </View>

          <View style={styles.focusCard}>
            <View style={styles.focusContent}>
              <Text style={styles.focusEyebrow}>
                TODAY'S FOCUS
              </Text>

              <Text style={styles.focusTitle}>
                Keep things moving.
              </Text>

              <Text style={styles.focusText}>
                {stats.pendingTasks > 0
                  ? `${stats.pendingTasks} ${
                      stats.pendingTasks === 1 ? 'task' : 'tasks'
                    } still need your attention.`
                  : 'Everything on your list is complete.'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityLabel="Open tasks"
              style={styles.focusIcon}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Ionicons
                name={
                  stats.pendingTasks > 0
                    ? 'arrow-forward'
                    : 'checkmark'
                }
                size={20}
                color={COLORS.charcoal}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function MetricCard({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
}: {
  title: string;
  value: number | undefined;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View
        style={[
          styles.metricIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <Text style={styles.metricValue}>{value ?? 0}</Text>

      <Text style={styles.metricLabel}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },

  intro: {
    marginBottom: 20,
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 7,
  },

  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 330,
  },

  progressCard: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 22,
    padding: 20,
    marginTop: 4,
    marginBottom: 14,
    shadowColor: '#111418',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },

  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressTextBlock: {
    flex: 1,
    paddingRight: 12,
  },

  darkEyebrow: {
    color: '#AEB4BD',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 7,
  },

  progressTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.4,
  },

  progressSubtitle: {
    color: '#BFC4CB',
    fontSize: 12,
    marginTop: 5,
  },

  progressBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressBadgeValue: {
    color: COLORS.charcoal,
    fontSize: 16,
    fontWeight: '800',
  },

  progressTrack: {
    height: 6,
    backgroundColor: '#4B4C50',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 20,
  },

  progressFill: {
    height: '100%',
    backgroundColor: COLORS.lime,
    borderRadius: 999,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  metricCard: {
    width: '48.5%',
    minHeight: 142,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#52667A',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.055,
    shadowRadius: 8,
    elevation: 1,
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  metricValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.4,
  },

  metricLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  inProgressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginTop: 1,
  },

  inProgressIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inProgressText: {
    flex: 1,
    paddingHorizontal: 13,
  },

  inProgressLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  inProgressHint: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  inProgressValueContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },

  inProgressValue: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: '700',
  },

  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 14,
  },

  focusContent: {
    flex: 1,
  },

  focusEyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 5,
  },

  focusTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },

  focusText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },

  focusIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
