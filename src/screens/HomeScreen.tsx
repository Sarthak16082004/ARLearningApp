import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onStart: (category: string) => void;
};

const CATEGORIES = [
  { id: 'alphabet', label: 'Alphabets A–Z', emoji: '🔤', color: '#6c63ff' },
  { id: 'numbers', label: 'Numbers 0–9', emoji: '🔢', color: '#ff6584' },
  { id: 'shapes', label: 'Shapes', emoji: '🔷', color: '#43b89c' },
];

export default function HomeScreen({ onStart }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badge}>✨ AR-Powered</Text>
        <Text style={styles.title}>AR Learning{'\n'}App</Text>
        <Text style={styles.subtitle}>
          Point your camera and watch letters come to life!
        </Text>
      </View>

      {/* Category Cards */}
      <View style={styles.cardList}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { borderColor: cat.color + '55' }]}
            onPress={() => onStart(cat.id)}
            activeOpacity={0.8}>
            <View style={[styles.cardIcon, { backgroundColor: cat.color + '22' }]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{cat.label}</Text>
              <Text style={styles.cardSub}>Tap to start AR session</Text>
            </View>
            <Text style={[styles.cardArrow, { color: cat.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer note */}
      <Text style={styles.footerNote}>
        Requires camera permission to use AR features
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  badge: {
    color: '#a78bfa',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    lineHeight: 22,
  },
  cardList: {
    gap: 14,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  cardBody: {
    flex: 1,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  cardArrow: {
    fontSize: 28,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    marginTop: 16,
  },
});
