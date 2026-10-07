import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ options, selectedValue, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.chip, selectedValue === option.value && styles.chipSelected]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[styles.text, selectedValue === option.value && styles.textSelected]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 50,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  text: {
    color: '#4B5563',
    fontWeight: '500',
  },
  textSelected: {
    color: '#1D4ED8',
  },
});
