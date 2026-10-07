import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { LoadingScreen } from '../src/components/LoadingScreen';

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
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="projects/[id]" options={{ title: 'Project Details' }} />
      <Stack.Screen name="projects/create" options={{ title: 'Create Project', presentation: 'modal' }} />
      <Stack.Screen name="projects/edit/[id]" options={{ title: 'Edit Project', presentation: 'modal' }} />
      <Stack.Screen name="tasks/create" options={{ title: 'Create Task', presentation: 'modal' }} />
      <Stack.Screen name="tasks/edit/[id]" options={{ title: 'Edit Task', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
