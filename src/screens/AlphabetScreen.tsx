import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import ARScene3D from '../ar/ARScene3D';
import { getAlphabetSceneHTML, ALPHABET_DATA } from '../ar/scenes/alphabetScene';

const LETTERS = Object.keys(ALPHABET_DATA);

const AlphabetScreen = () => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (letter: string) => {
    setSelected(prev => (prev === letter ? null : letter));
  };

  const selectedData = selected ? ALPHABET_DATA[selected] : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 3D AR Scene overlay */}
      {selected && selectedData && (
        <ARScene3D
          html={getAlphabetSceneHTML(
            selected,
            selectedData.word,
            selectedData.emoji,
            selectedData.color,
          )}
        />
      )}

      {/* Letter picker at bottom */}
      <View style={styles.pickerWrapper} pointerEvents="box-none">
        <Text style={styles.hint}>
          {selected ? `${selected} is for ${selectedData?.word}` : 'Tap a letter to see it in AR'}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          pointerEvents="box-none">
          {LETTERS.map(letter => {
            const d = ALPHABET_DATA[letter];
            const isActive = selected === letter;
            return (
              <TouchableOpacity
                key={letter}
                style={[
                  styles.letterButton,
                  isActive && { backgroundColor: d.color, borderColor: d.color },
                ]}
                onPress={() => handleSelect(letter)}
                activeOpacity={0.75}>
                <Text style={styles.letterText}>{letter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 10,
    letterSpacing: 0.5,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  letterButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  letterText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
});

export default AlphabetScreen;
