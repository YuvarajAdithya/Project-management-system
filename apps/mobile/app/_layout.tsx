import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  text: '#111418',
  muted: '#6E7785',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar
        style="dark"
        backgroundColor={COLORS.canvas}
        translucent={false}
      />

      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: COLORS.canvas,
          },
          headerStyle: {
            backgroundColor: COLORS.canvas,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="projects/[id]"
          options={{
            title: 'Project Details',
          }}
        />

        <Stack.Screen
          name="projects/create"
          options={{
            title: 'Create Project',
            presentation: 'modal',
            contentStyle: {
              backgroundColor: COLORS.surface,
            },
          }}
        />

        <Stack.Screen
          name="projects/edit/[id]"
          options={{
            title: 'Edit Project',
            presentation: 'modal',
            contentStyle: {
              backgroundColor: COLORS.surface,
            },
          }}
        />

        <Stack.Screen
          name="tasks/create"
          options={{
            title: 'Create Task',
            presentation: 'modal',
            contentStyle: {
              backgroundColor: COLORS.surface,
            },
          }}
        />

        <Stack.Screen
          name="tasks/edit/[id]"
          options={{
            title: 'Edit Task',
            presentation: 'modal',
            contentStyle: {
              backgroundColor: COLORS.surface,
            },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
