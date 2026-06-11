// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../src/utils/theme';

const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.iconWrap}>
    <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
    <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
    {focused && <View style={styles.dot} />}
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', gap: 2, paddingTop: 4 },
  icon: { fontSize: 22, opacity: 0.5 },
  iconFocused: { opacity: 1 },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  labelFocused: { color: COLORS.primary, fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primary, marginTop: 2 },
});
