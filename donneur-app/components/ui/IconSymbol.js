import React from 'react';
import { Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView } from 'expo-symbols';

// Mapping SF Symbols (iOS) to MaterialIcons (Android/Web)
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'message.fill': 'message', // Adjusted for Material Icons
  'arrow.up.circle.fill': 'arrow-upward', // Adjusted
  'person.2.fill': 'group', // Adjusted
};

/**
 * Uses SF Symbols on iOS, and MaterialIcons on Android/Web.
 */
export default function IconSymbol({ name, size = 24, color, style }) {
  // Use SF Symbols on iOS
  if (Platform.OS === 'ios') {
    return <SymbolView name={name} tintColor={color} style={[{ width: size, height: size }, style]} />;
  }

  // Use Material Icons on Android/Web (mapped fallback)
  return <MaterialIcons name={MAPPING[name] || name} size={size} color={color} style={style} />;
}
