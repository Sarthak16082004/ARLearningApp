import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import AlphabetScreen from './AlphabetScreen';
import NumbersScreen from './NumbersScreen';
import ShapesScreen from './ShapesScreen';

type Props = {
  category: string;
  onBack: () => void;
};

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  alphabet: { label: 'Alphabets', emoji: '🔤', color: '#6c63ff' },
  numbers: { label: 'Numbers', emoji: '🔢', color: '#ff6584' },
  shapes: { label: 'Shapes', emoji: '🔷', color: '#43b89c' },
  animals: { label: 'Animals', emoji: '🦁', color: '#f59e0b' },
};

export default function CameraScreen({ category, onBack }: Props) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [permissionChecked, setPermissionChecked] = useState(false);
  const meta = CATEGORY_META[category] || { label: category, emoji: '📷', color: '#6c63ff' };

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Camera Permission Required', 'Please grant camera access in Settings.');
        }
      }
      setPermissionChecked(true);
    })();
  }, [hasPermission, requestPermission]);

  if (!permissionChecked) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>Camera permission denied.</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.infoText}>No camera found.</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Live Camera */}
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />

      {/* 3D AR Overlay per category */}
      {category === 'alphabet' && <AlphabetScreen />}
      {category === 'numbers' && <NumbersScreen />}
      {category === 'shapes' && <ShapesScreen />}
      {category === 'animals' && (
        <View style={styles.comingSoon} pointerEvents="none">
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonEmoji}>🦁</Text>
            <Text style={styles.comingSoonTitle}>Animals AR</Text>
            <Text style={styles.comingSoonSub}>Coming Soon!</Text>
          </View>
        </View>
      )}

      {/* HUD */}
      <View style={styles.hud}>
        <TouchableOpacity onPress={onBack} style={styles.hudButton}>
          <Text style={styles.hudText}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.hudLabel, { borderColor: meta.color + '66' }]}>
          <Text style={styles.hudEmoji}>{meta.emoji}</Text>
          <Text style={[styles.hudLabelText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, backgroundColor: '#0a0a1a',
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  infoText: { color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },
  hud: {
    position: 'absolute', top: 48, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  hudButton: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  hudText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  hudLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1,
  },
  hudEmoji: { fontSize: 16 },
  hudLabelText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.8 },
  comingSoon: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center',
    alignItems: 'center', bottom: 100,
  },
  comingSoonCard: {
    backgroundColor: 'rgba(10,10,30,0.88)', borderRadius: 24, padding: 28,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
    gap: 10, minWidth: 220,
  },
  comingSoonEmoji: { fontSize: 52 },
  comingSoonTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  comingSoonSub: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  backButton: {
    backgroundColor: '#1a1a2e', paddingVertical: 12, paddingHorizontal: 28,
    borderRadius: 12, borderWidth: 1, borderColor: '#444',
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
