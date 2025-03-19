import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Text, View, StyleSheet } from 'react-native';

// Custom header component
const CustomHeader = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

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
        // Custom header for all tabs
        header: ({ options }) => <CustomHeader title={options.title} />,
      })}
    >
      <Tabs.Screen name="index"         options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="finance"       options={{ title: 'Finance' }} />
      <Tabs.Screen name="organization"  options={{ title: 'Organization' }} />
      <Tabs.Screen name="test"  options={{ title: 'test' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});
