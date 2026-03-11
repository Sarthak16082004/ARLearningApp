import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARObject } from './ARViewScreen';

import { db, COLLECTIONS } from '../../config/firebase';

const STATIC_ANIMALS: ARObject[] = [
    {
        id: 'lion',
        name: 'Lion',
        category: 'animal',
        modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Animal/glTF/Animal.gltf',
        modelType: 'GLTF',
    },
    {
        id: 'fox',
        name: 'Fox',
        category: 'animal',
        modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Fox/glTF-Binary/Fox.glb',
        modelType: 'GLB',
    },
    {
        id: 'duck',
        name: 'Duck',
        category: 'animal',
        modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Duck/glTF-Binary/Duck.glb',
        modelType: 'GLB',
    },
];

type Props = {
    onBack: () => void;
    onSelectAnimal: (animal: ARObject) => void;
};

export default function AnimalListScreen({ onBack, onSelectAnimal }: Props) {
    const insets = useSafeAreaInsets();
    const [animals, setAnimals] = React.useState<ARObject[]>(STATIC_ANIMALS);

    React.useEffect(() => {
        // Fetch new animals from cloud
        const unsubscribe = db.collection(COLLECTIONS.AR_CONTENT)
            .where('category', '==', 'animal')
            .onSnapshot(snapshot => {
                const cloudAnimals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ARObject[];

                // Merge static and cloud (avoid duplicates by name if any)
                const merged = [...STATIC_ANIMALS];
                cloudAnimals.forEach(ca => {
                    if (!merged.find(m => m.name.toLowerCase() === ca.name.toLowerCase())) {
                        merged.push(ca);
                    }
                });
                setAnimals(merged);
            });

        return () => unsubscribe();
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🦁 Choose an Animal</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {animals.map(animal => (
                    <TouchableOpacity
                        key={animal.id}
                        style={styles.card}
                        onPress={() => onSelectAnimal(animal)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconBox}>
                            <Text style={styles.emoji}>{animal.id === 'lion' ? '🦁' : animal.id === 'fox' ? '🦊' : '🦆'}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{animal.name}</Text>
                            <Text style={styles.sub}>View in 3D AR world</Text>
                        </View>
                        <View style={styles.viewBtn}>
                            <Text style={styles.viewTxt}>View AR</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07071a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 16,
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    backText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    scroll: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 16,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: { fontSize: 32 },
    info: { flex: 1 },
    name: { color: '#fff', fontSize: 18, fontWeight: '700' },
    sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
    viewBtn: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    viewTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
