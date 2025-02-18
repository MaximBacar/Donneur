import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AuthProvider } from '../../context/authContext';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'index') {
            iconName = 'home';
          } else if (route.name === 'chat') {
            iconName = 'chat';
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
      <Tabs.Screen name="chat"      options={{ title: 'Chat' }} />
      <Tabs.Screen name="map"       options={{ title: 'Map' }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profile' }} />
    </Tabs>
  );
}
