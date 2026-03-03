import React, { useRef, useState } from 'react';
import { View, Image, StyleSheet, PanResponder, Text, TouchableOpacity } from 'react-native';
import { CustomItem } from './UploadScreen';

type Props = {
    item: CustomItem;
    onClose: () => void;
};

export default function CustomARViewer({ item, onClose }: Props) {
    const panRef = useRef({ x: 0, y: 0 });
    const [pos, setPos] = useState({ x: 0, y: -80 });
    const [scale, setScale] = useState(1);
    const pinchRef = useRef({ dist: 0 });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                panRef.current = { x: pos.x, y: pos.y };
            },
            onPanResponderMove: (_, gs) => {
                setPos({ x: panRef.current.x + gs.dx, y: panRef.current.y + gs.dy });
            },
        })
    ).current;

    const colorMap: Record<string, string> = {
        alphabet: '#6c63ff', number: '#ff6584', shape: '#43b89c', animal: '#f59e0b',
    };
    const accent = colorMap[item.category] || '#6c63ff';

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Draggable AR card */}
            <View
                style={[styles.arCard, {
                    transform: [{ translateX: pos.x }, { translateY: pos.y }, { scale }],
                    borderColor: accent + '88',
                }]}
                {...panResponder.panHandlers}>
                {/* Drag handle indicator */}
                <View style={styles.dragHandle} />

                <Image source={{ uri: item.uri }} style={styles.arImage} resizeMode="contain" />

                <View style={[styles.labelBand, { backgroundColor: accent + 'dd' }]}>
                    <Text style={styles.labelText}>{item.name}</Text>
                    <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                </View>

                {/* Ground shadow */}
                <View style={styles.shadow} />
            </View>

            {/* Scale controls */}
            <View style={styles.scaleControls} pointerEvents="box-none">
                <TouchableOpacity style={styles.scaleBtn} onPress={() => setScale(s => Math.min(s + 0.2, 3))}>
                    <Text style={styles.scaleTxt}>＋</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scaleBtn} onPress={() => setScale(s => Math.max(s - 0.2, 0.3))}>
                    <Text style={styles.scaleTxt}>－</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.scaleBtn, styles.resetBtn]} onPress={() => { setPos({ x: 0, y: -80 }); setScale(1); }}>
                    <Text style={styles.scaleTxt}>↺</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.scaleBtn, styles.closeBtn]} onPress={onClose}>
                    <Text style={styles.scaleTxt}>✕</Text>
                </TouchableOpacity>
            </View>

            {/* Hint */}
            <View style={styles.hintBar} pointerEvents="none">
                <Text style={styles.hintText}>Drag the card to place it in your world</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    arCard: {
        position: 'absolute', alignSelf: 'center', top: '35%',
        width: 200, backgroundColor: 'rgba(8,8,28,0.88)',
        borderRadius: 20, overflow: 'hidden', borderWidth: 2,
        elevation: 12, shadowColor: '#000', shadowRadius: 16, shadowOpacity: 0.5,
    },
    dragHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'center', marginTop: 10, marginBottom: 4,
    },
    arImage: { width: '100%', height: 180 },
    labelBand: { paddingVertical: 10, paddingHorizontal: 14 },
    labelText: { color: '#fff', fontSize: 16, fontWeight: '900' },
    categoryText: {
        color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700',
        letterSpacing: 1.5, marginTop: 2
    },
    shadow: {
        height: 10, marginHorizontal: 24, marginBottom: 2,
        backgroundColor: 'rgba(0,0,0,0)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    scaleControls: {
        position: 'absolute', right: 14, top: '30%',
        gap: 8,
    },
    scaleBtn: {
        backgroundColor: 'rgba(0,0,0,0.65)', width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    },
    resetBtn: { borderColor: 'rgba(108,99,255,0.5)' },
    closeBtn: { borderColor: 'rgba(255,100,132,0.5)' },
    scaleTxt: { color: '#fff', fontSize: 18, fontWeight: '700' },
    hintBar: {
        position: 'absolute', bottom: 130, alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 6,
        borderRadius: 20,
    },
    hintText: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
});
