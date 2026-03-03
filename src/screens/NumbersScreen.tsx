import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import ARScene3D from '../ar/ARScene3D';
import { getNumberSceneHTML } from '../ar/scenes/numberScene';

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const NumbersScreen = () => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* 3D AR Number Scene */}
            {selected !== null && (
                <ARScene3D html={getNumberSceneHTML(selected)} />
            )}

            {/* Number picker */}
            <View style={styles.pickerWrapper}>
                <Text style={styles.hint}>
                    {selected !== null ? `Number ${selected}` : 'Tap a number to see it in 3D AR'}
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    {NUMBERS.map(num => {
                        const isActive = selected === num;
                        return (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.numButton,
                                    isActive && { backgroundColor: COLORS[num], borderColor: COLORS[num] },
                                ]}
                                onPress={() => setSelected(prev => prev === num ? null : num)}
                                activeOpacity={0.75}>
                                <Text style={styles.numText}>{num}</Text>
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
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    numButton: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    numText: { fontSize: 22, fontWeight: '900', color: '#fff' },
});

export default NumbersScreen;
