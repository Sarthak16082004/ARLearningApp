// HelloAR.tsx
// Placeholder - react-viro removed. AR is handled via Camera + Overlay approach.
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HelloAR() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello AR!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: '#fff', fontSize: 24 },
});
