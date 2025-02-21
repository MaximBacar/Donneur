import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

export function AvatarWithLoading({ uri, style, placeholderStyle }) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ position: 'relative', ...style }}>
      {loading && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          size="small"
          color="#000"
        />
      )}
      <Image
        source={{ uri }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}
