import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ARObject } from './ARViewScreen';
import { supabase } from '../../config/supabase';

const CATEGORY_META: any = {
    alphabet: { label: 'Alphabet', emoji: '🔤', color: '#6c63ff', standardTitle: 'Standard Alphabet AR' },
    numbers: { label: 'Numbers', emoji: '🔢', color: '#ff6584', standardTitle: 'Standard Numbers AR' },
    shapes: { label: 'Shapes', emoji: '🔷', color: '#43b89c', standardTitle: 'Standard Shapes AR' },
    animals: { label: 'Animals', emoji: '🦁', color: '#f59e0b', standardTitle: 'Standard Animals AR' },
};

const STATIC_ANIMALS: ARObject[] = [
    { id: 'lion', name: 'Lion', category: 'animals', modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Animal/glTF/Animal.gltf', modelType: 'GLTF' },
    { id: 'fox', name: 'Fox', category: 'animals', modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Fox/glTF-Binary/Fox.glb', modelType: 'GLB' },
    { id: 'duck', name: 'Duck', category: 'animals', modelUrl: 'https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Duck/glTF-Binary/Duck.glb', modelType: 'GLB' },
];

type Props = {
    category: string;
    onBack: () => void;
    onStartCamera: () => void;
    onSelectModel: (model: ARObject) => void;
};

export default function CategoryListScreen({ category, onBack, onStartCamera, onSelectModel }: Props) {
    const insets = useSafeAreaInsets();
    const meta = CATEGORY_META[category] || { label: category, emoji: '✨', color: '#8b5cf6', standardTitle: 'Standard AR' };
    const [models, setModels] = useState<ARObject[]>(category === 'animals' ? STATIC_ANIMALS : []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch 3D Projects uploaded by teachers
                const { data: projectData } = await supabase.from('ar_projects').select('*').eq('category', category);
                // Fetch 2D AR Content uploaded by teachers
                const { data: contentData } = await supabase.from('ar_content').select('*').eq('category', category);

                let fetchedModels: ARObject[] = [];
                if (category === 'animals') fetchedModels = [...STATIC_ANIMALS];

                if (projectData) {
                    projectData.forEach(p => {
                        fetchedModels.push({
                            id: p.id,
                            name: p.title,
                            category: p.category,
                            modelUrl: p.modelUrl,
                            modelType: p.modelType || 'GLB',
                        });
                    });
                }

                if (contentData) {
                    contentData.forEach(c => {
                        // Avoid duplicates if using same name
                        if (!fetchedModels.find(m => m.name.toLowerCase() === c.name.toLowerCase())) {
                            fetchedModels.push({
                                id: c.id,
                                name: c.name,
                                category: c.category,
                                modelUrl: c.uri || c.modelUrl,
                                modelType: c.modelType || 'IMAGE_PLANE', // Image Plane by default for 2D
                            });
                        }
                    });
                }
                setModels(fetchedModels);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [category]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{meta.emoji} {meta.label}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                
                {/* Standard Built-in AR Engine */}
                {category !== 'animals' && (
                    <>
                        <Text style={styles.sectionTitle}>Built-in Lesson</Text>
                        <TouchableOpacity style={[styles.card, { borderColor: meta.color + '55' }]} onPress={onStartCamera} activeOpacity={0.8}>
                            <View style={[styles.iconBox, { backgroundColor: meta.color + '22' }]}>
                                <Text style={styles.emoji}>{meta.emoji}</Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{meta.standardTitle}</Text>
                                <Text style={styles.sub}>Open interactive AR camera logic</Text>
                            </View>
                            <View style={[styles.viewBtn, { backgroundColor: meta.color }]}>
                                <Text style={styles.viewTxt}>Start AR</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}

                <Text style={[styles.sectionTitle, { marginTop: category !== 'animals' ? 24 : 0 }]}>Teacher Uploaded Models</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color={meta.color} style={{marginTop: 40}} />
                ) : models.length === 0 ? (
                    <Text style={{color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40, fontSize: 13}}>No teacher projects uploaded here yet.</Text>
                ) : (
                    models.map(model => (
                        <TouchableOpacity key={model.id} style={styles.card} onPress={() => onSelectModel(model)} activeOpacity={0.8}>
                            <View style={styles.iconBox}>
                                <Text style={styles.emoji}>{model.modelType === 'IMAGE_PLANE' ? '🖼️' : '🧊'}</Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{model.name}</Text>
                                <Text style={styles.sub}>View in 3D AR world</Text>
                            </View>
                            <View style={[styles.viewBtn, { backgroundColor: '#f59e0b' }]}>
                                <Text style={styles.viewTxt}>View AR</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
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
    sectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
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
