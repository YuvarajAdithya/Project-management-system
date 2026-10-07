import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let backgroundColor = '#FDE68A'; // amber
  let textColor = '#D97706';
  let label = status.replace('_', ' ');

  if (status === 'IN_PROGRESS') {
    backgroundColor = '#DBEAFE'; // blue
    textColor = '#2563EB';
  } else if (status === 'COMPLETED') {
    backgroundColor = '#D1FAE5'; // green
    textColor = '#059669';
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
