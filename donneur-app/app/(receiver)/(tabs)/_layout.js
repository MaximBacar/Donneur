import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { AuthProvider } from '../../../context/authContext';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false, // Disable the header here
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'inbox') {
            iconName = 'mail';
          } else if (route.name === 'map') {
            iconName = 'compass';
          } else if (route.name === 'profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tabs.Screen name="index"     options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="inbox"      options={{ title: 'Inbox' }} />
      <Tabs.Screen name="map"       options={{ title: 'Map' }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile' }} />
    </Tabs>
  );
}
