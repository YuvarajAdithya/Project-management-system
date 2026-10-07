import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';

export const colors = {
  canvas: '#EAF2FB', surface: '#F7FAFD', charcoal: '#2B2B2E', text: '#111418',
  muted: '#6E7785', secondary: '#4F5A6A', lime: '#DFFF37', border: '#D7E1EB',
  blue: '#8DB8D3', green: '#8BC49A', amber: '#F3C35F', coral: '#E97A68',
};

export function FormScreen({ title, subtitle, auth = false, children }: React.PropsWithChildren<{ title: string; subtitle: string; auth?: boolean }>) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={headerHeight}>
    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 24, paddingTop: auth ? insets.top + 32 : 24, paddingLeft: Math.max(insets.left, 20), paddingRight: Math.max(insets.right, 20) }]}>
      <View style={styles.inner}>
        <View style={styles.brand}><View style={styles.brandIcon}><Ionicons name="checkmark" size={23} color={colors.lime} /></View><Text style={styles.brandText}>Tasko</Text></View>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.card}>{children}</View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput placeholderTextColor={colors.muted} selectionColor={colors.blue} accessibilityLabel={label} {...props} style={[styles.input, props.multiline && styles.multiline, props.style]} />
    {hint && <Text style={styles.hint}>{hint}</Text>}
  </View>;
}

const labels: Record<string, string> = { NOT_STARTED: 'Not started', PENDING: 'Pending', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
const tones: Record<string, string> = { NOT_STARTED: colors.amber, PENDING: colors.amber, IN_PROGRESS: colors.blue, COMPLETED: colors.green, LOW: colors.green, MEDIUM: colors.amber, HIGH: colors.coral };

export function Choices({ label, options, value, onChange, disabled = false }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={styles.choices}>
    {options.map(option => <TouchableOpacity key={option.value} accessibilityRole="radio" accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{ checked: value === option.value, disabled }} disabled={disabled} onPress={() => onChange(option.value)} style={[styles.choice, value === option.value && styles.choiceActive, disabled && styles.disabled]}>
      {tones[option.value] && <View style={[styles.dot, { backgroundColor: tones[option.value] }]} />}
      <Text style={[styles.choiceText, value === option.value && styles.choiceTextActive]}>{option.label}</Text>
      {value === option.value && <Ionicons name="checkmark" size={16} color={colors.lime} />}
    </TouchableOpacity>)}
  </View></View>;
}

export const enumOptions = (values: string[]) => values.map(value => ({ value, label: labels[value] || value }));

export function Badge({ value }: { value: string }) {
  return <View style={[styles.badge, { backgroundColor: tones[value] || colors.canvas }]}><Text style={styles.badgeText}>{labels[value] || value}</Text></View>;
}

export function Action({ label, onPress, busy = false, disabled = false, secondary = false, destructive = false }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean; secondary?: boolean; destructive?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress} style={[styles.action, secondary && styles.secondaryAction, destructive && styles.destructiveAction, (disabled || busy) && styles.disabled]}>
    {busy && <ActivityIndicator color={secondary || destructive ? colors.charcoal : colors.lime} />}
    <Text style={[styles.actionText, secondary && styles.secondaryText, destructive && styles.destructiveText]}>{busy ? 'Please wait…' : label}</Text>
  </TouchableOpacity>;
}

export function Notice({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  if (!message) return null;
  return <View accessibilityLiveRegion="polite" style={styles.notice}><Text style={styles.noticeText}>{message}</Text>{onRetry && <Action label="Try again" onPress={onRetry} secondary />}</View>;
}

export function FormLoading() {
  return <View style={styles.loading} accessibilityLabel="Loading" accessibilityState={{ busy: true }}><ActivityIndicator size="large" color={colors.charcoal} /><Text style={styles.hint}>Loading your details…</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1 }, inner: { width: '100%', maxWidth: 620, alignSelf: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 },
  brandIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 22, fontWeight: '700', color: colors.text },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, color: colors.text },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.secondary, marginTop: 10, marginBottom: 26 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 22 },
  field: { gap: 9 }, label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: { minHeight: 50, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#AEBDCD', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: colors.text },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  hint: { color: colors.secondary, fontSize: 13, lineHeight: 20 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { minHeight: 46, maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: '#FFFFFF' },
  choiceActive: { backgroundColor: colors.charcoal, borderColor: colors.charcoal },
  choiceText: { color: colors.secondary, fontSize: 14, fontWeight: '500', flexShrink: 1 },
  choiceTextActive: { color: '#FFFFFF' }, dot: { width: 7, height: 7, borderRadius: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.charcoal },
  action: { minHeight: 50, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 15, backgroundColor: colors.charcoal, borderWidth: 1, borderColor: colors.charcoal },
  actionText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', flexShrink: 1 },
  secondaryAction: { backgroundColor: '#FFFFFF', borderColor: colors.border }, secondaryText: { color: colors.charcoal },
  destructiveAction: { backgroundColor: '#FCEDE9', borderColor: colors.coral }, destructiveText: { color: '#9F3E2E' },
  disabled: { opacity: 0.55 }, notice: { borderRadius: 14, backgroundColor: '#FCEDE9', borderWidth: 1, borderColor: colors.coral, padding: 14, gap: 12 },
  noticeText: { color: '#9F3E2E', fontSize: 14, lineHeight: 21 },
  loading: { flex: 1, backgroundColor: colors.canvas, justifyContent: 'center', alignItems: 'center', gap: 16 },
});
