import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'finance') {
            iconName = 'compass';
          } else if (route.name === 'organization') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tabs.Screen name="index"         options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="finance"       options={{ title: 'Finance' }} />
      <Tabs.Screen name="organization"  options={{ title: 'Organization' }} />
    </Tabs>
  );
}
