// ARScreen.tsx
// This screen is reserved for future AR integration using a supported library.
// @viro-community/react-viro has been removed due to incompatibility with React Native 0.83+.
// The current AR experience is handled via CameraScreen + AlphabetOverlay.

import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ARScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AR Scene (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
