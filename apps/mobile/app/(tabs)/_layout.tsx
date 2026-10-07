import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  canvas: '#EAF2FB',
  surface: '#F7FAFD',
  charcoal: '#2B2B2E',
  text: '#111418',
  muted: '#7A8492',
  lime: '#DFFF37',
  border: 'rgba(120, 140, 160, 0.18)',
};

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused && styles.iconContainerActive,
      ]}
    >
      <Ionicons
        name={name}
        size={20}
        color={focused ? COLORS.charcoal : color}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.canvas,
        },
        headerTitleStyle: {
          color: COLORS.text,
          fontSize: 20,
          fontWeight: '700',
        },
        headerShadowVisible: false,

        sceneStyle: {
          backgroundColor: COLORS.canvas,
        },

        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.muted,

        tabBarStyle: {
          height: Platform.OS === 'android' ? 68 : 82,
          paddingTop: 7,
          paddingBottom: Platform.OS === 'android' ? 8 : 20,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 10,
          shadowColor: '#111418',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarItemStyle: {
          paddingVertical: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'folder' : 'folder-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={
                focused
                  ? 'checkmark-circle'
                  : 'checkmark-circle-outline'
              }
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 34,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerActive: {
    backgroundColor: COLORS.lime,
  },
});
