import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let backgroundColor = '#F3F4F6'; // gray
  let textColor = '#4B5563';

  if (priority === 'MEDIUM') {
    backgroundColor = '#FFEDD5'; // orange
    textColor = '#EA580C';
  } else if (priority === 'HIGH') {
    backgroundColor = '#FEE2E2'; // red
    textColor = '#DC2626';
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{priority}</Text>
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
