import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors } from '../../../../constants/colors';

export function AvatarWithLoading({ uri, style, placeholderStyle }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={[styles.placeholderContainer, StyleSheet.absoluteFill]}>
          <ActivityIndicator
            size="small"
            color={Colors.light.tint}
          />
        </View>
      )}
      
      {!error && (
        <Animated.View 
          entering={FadeIn.duration(300)}
          style={StyleSheet.absoluteFill}
        >
          <Image
            source={{ uri }}
            style={[styles.image, style]}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        </Animated.View>
      )}
      
      {error && (
        <View style={[styles.errorContainer, StyleSheet.absoluteFill]}>
          <View style={styles.errorIconContainer} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#F6F8FA',
    overflow: 'hidden',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
  },
  errorIconContainer: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    backgroundColor: Colors.light.icon,
    opacity: 0.5,
  }
});
