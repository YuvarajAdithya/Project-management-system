import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function ErrorNotice({ message, onRetry }: { message: string | null; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} accessibilityRole="button" style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#FEF2F2', borderRadius: 8, padding: 12, margin: 16 },
  message: { color: '#B91C1C', fontSize: 14 },
  retry: { alignSelf: 'flex-start', paddingVertical: 10 },
  retryText: { color: '#1D4ED8', fontWeight: '600' },
});
