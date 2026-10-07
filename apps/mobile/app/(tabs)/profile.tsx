import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>Member since {new Date(user?.createdAt || '').toLocaleDateString()}</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.menuItemTextRed}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#fff', alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#1D4ED8' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  email: { fontSize: 16, color: '#6B7280', marginBottom: 8 },
  memberSince: { fontSize: 12, color: '#9CA3AF' },
  menu: { marginTop: 24, backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemTextRed: { fontSize: 16, color: '#EF4444', marginLeft: 12, fontWeight: '500' },
});
