import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/contexts/AuthContext';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  white: '#FFFFFF',
  charcoal: '#2B2B2E',
  text: '#111418',
  muted: '#6E7785',
  lime: '#DFFF37',
  blueSoft: '#E8F2F8',
  blue: '#4E7D98',
  coral: '#E97A68',
  border: 'rgba(120, 140, 160, 0.18)',
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out of Tasko?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const initial =
    user?.fullName?.charAt(0).toUpperCase() || '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          year: 'numeric',
        }
      )
    : '—';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>
          YOUR PERSONAL WORKSPACE
        </Text>

        <Text style={styles.heading}>
          Profile
        </Text>

        <Text style={styles.subtitle}>
          Your Tasko account and workspace details.
        </Text>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initial}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.fullName || 'Tasko user'}
        </Text>

        <Text style={styles.email}>
          {user?.email || ''}
        </Text>

        <View style={styles.workspaceBadge}>
          <View style={styles.workspaceDot} />

          <Text style={styles.workspaceBadgeText}>
            Personal workspace
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ACCOUNT DETAILS
        </Text>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="person-outline"
            label="Name"
            value={user?.fullName || '—'}
          />

          <View style={styles.divider} />

          <DetailRow
            icon="mail-outline"
            label="Email"
            value={user?.email || '—'}
          />

          <View style={styles.divider} />

          <DetailRow
            icon="calendar-outline"
            label="Member since"
            value={memberSince}
          />
        </View>
      </View>

      <View style={styles.securityCard}>
        <View style={styles.securityIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color={COLORS.charcoal}
          />
        </View>

        <View style={styles.securityText}>
          <Text style={styles.securityTitle}>
            Your workspace is private
          </Text>

          <Text style={styles.securityDescription}>
            Your projects and tasks belong to your account.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.84}
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <View style={styles.logoutIcon}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#B94E3F"
          />
        </View>

        <View style={styles.logoutTextContainer}>
          <Text style={styles.logoutTitle}>
            Log out
          </Text>

          <Text style={styles.logoutDescription}>
            Sign out of this device
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#C98378"
        />
      </TouchableOpacity>

      <Text style={styles.footer}>
        Tasko · Thoughtfully organized.
      </Text>
    </ScrollView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.blue}
        />
      </View>

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={styles.detailValue}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
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
    paddingBottom: 35,
  },

  intro: {
    marginBottom: 18,
  },

  eyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
    marginBottom: 5,
  },

  heading: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  accountCard: {
    alignItems: 'center',
    backgroundColor: COLORS.charcoal,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginBottom: 22,

    shadowColor: '#111418',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 13,

    elevation: 4,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  avatarText: {
    color: COLORS.charcoal,
    fontSize: 27,
    fontWeight: '800',
  },

  name: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },

  email: {
    color: '#BCC3CB',
    fontSize: 13,
    marginTop: 5,
  },

  workspaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B3C40',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 14,
  },

  workspaceDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.lime,
    marginRight: 7,
  },

  workspaceBadgeText: {
    color: '#D7DADE',
    fontSize: 10,
    fontWeight: '600',
  },

  section: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 8,
    marginLeft: 3,
  },

  detailsCard: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  detailIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    flex: 1,
    paddingLeft: 12,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 49,
  },

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.67)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 14,
  },

  securityIcon: {
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityText: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  securityDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F2D1CB',
    padding: 14,
  },

  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FDEBE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },

  logoutTitle: {
    color: '#B94E3F',
    fontSize: 14,
    fontWeight: '700',
  },

  logoutDescription: {
    color: '#B8786D',
    fontSize: 11,
    marginTop: 2,
  },

  footer: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 22,
  },
});
