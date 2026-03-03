import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  letter: string;
  word: string;
  image: any;
  onClose: () => void;
};

const AlphabetOverlay = ({ letter, word, image, onClose }: Props) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.card}>
        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Letter badge */}
        <View style={styles.letterBadge}>
          <Text style={styles.letterBig}>{letter}</Text>
        </View>

        {/* Image or emoji placeholder */}
        {image ? (
          <Image
            source={image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>{letter}</Text>
          </View>
        )}

        {/* Word label */}
        <Text style={styles.wordText}>
          <Text style={styles.boldLetter}>{letter}</Text>
          {word.slice(1).toLowerCase()}
        </Text>
        <Text style={styles.subLabel}>{letter} is for {word}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(10, 10, 30, 0.88)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: 240,
    borderWidth: 1.5,
    borderColor: 'rgba(108, 99, 255, 0.6)',
    shadowColor: '#6c63ff',
    shadowRadius: 20,
    shadowOpacity: 0.5,
    elevation: 10,
    gap: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 10,
  },
  closeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '700',
  },
  letterBadge: {
    backgroundColor: '#6c63ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  letterBig: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  image: {
    width: 130,
    height: 130,
  },
  imagePlaceholder: {
    width: 130,
    height: 130,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.4)',
  },
  placeholderText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#a78bfa',
  },
  wordText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginTop: 4,
  },
  boldLetter: {
    color: '#a78bfa',
  },
  subLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
});

export default AlphabetOverlay;
