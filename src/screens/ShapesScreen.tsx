import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import ARScene3D from '../ar/ARScene3D';
import { getShapeSceneHTML, SHAPES, ShapeId } from '../ar/scenes/shapeScene';

const ShapesScreen = () => {
    const [selected, setSelected] = useState<ShapeId | null>(null);
    const selectedShape = SHAPES.find(s => s.id === selected);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* 3D AR Shape Scene */}
            {selected && selectedShape && (
                <ARScene3D
                    html={getShapeSceneHTML(selected, selectedShape.label, selectedShape.color)}
                />
            )}

            {/* Shape picker */}
            <View style={styles.pickerWrapper} pointerEvents="box-none">
                <Text style={styles.hint}>
                    {selected ? `${selectedShape?.emoji} ${selectedShape?.label} — drag to rotate!` : 'Tap a shape to see it in 3D AR'}
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    pointerEvents="box-none">
                    {SHAPES.map(shape => {
                        const isActive = selected === shape.id;
                        return (
                            <TouchableOpacity
                                key={shape.id}
                                style={[
                                    styles.shapeButton,
                                    isActive && { backgroundColor: shape.color, borderColor: shape.color },
                                ]}
                                onPress={() => setSelected(prev => prev === shape.id ? null : shape.id)}
                                activeOpacity={0.75}>
                                <Text style={styles.shapeEmoji}>{shape.emoji}</Text>
                                <Text style={styles.shapeLabel}>{shape.label}</Text>
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
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 12,
        gap: 8,
    },
    shapeButton: {
        backgroundColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        minWidth: 72,
    },
    shapeEmoji: { fontSize: 22 },
    shapeLabel: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 3 },
});

export default ShapesScreen;
