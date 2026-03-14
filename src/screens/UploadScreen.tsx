import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Image, TextInput, Alert, Animated, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase, uploadToSupabase } from '../config/supabase';

export type UploadCategory = 'alphabet' | 'number' | 'shape' | 'animal';
export type CustomItem = {
    id: string;
    name: string;
    category: UploadCategory;
    uri: string;
    createdAt: string;
    modelType?: string; // Optional if we add 3D support later
};

// --- Supabase Data Fetching ---
export async function loadCustomItems(): Promise<CustomItem[]> {
    try {
        const { data, error } = await supabase.from('ar_content')
            .select('*')
            .order('createdAt', { ascending: false });
        if (error) throw error;
        return (data || []) as CustomItem[];
    } catch (err) {
        console.error("Supabase Load Error:", err);
        return [];
    }
}

async function saveItemToSupabase(item: Omit<CustomItem, 'id'>) {
    return await supabase.from('ar_content').insert([item]);
}

const CATS: { id: UploadCategory; label: string; emoji: string; color: string }[] = [
    { id: 'alphabet', label: 'Alphabet', emoji: '🔤', color: '#6c63ff' },
    { id: 'number', label: 'Number', emoji: '🔢', color: '#ff6584' },
    { id: 'shape', label: 'Shape', emoji: '🔷', color: '#43b89c' },
    { id: 'animal', label: 'Animal', emoji: '🦁', color: '#f59e0b' },
];

type Props = { onBack: () => void };

export default function UploadScreen({ onBack }: Props) {
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState<CustomItem[]>([]);
    const [selCat, setSelCat] = useState<UploadCategory>('alphabet');
    const [name, setName] = useState('');
    const [pickedUri, setPickedUri] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [uploading, setUploading] = useState(false); // Global spinner
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        refreshItems();
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60 }).start();
    }, []);

    const refreshItems = async () => {
        const data = await loadCustomItems();
        setItems(data);
    };

    const pickImage = async () => {
        const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
        if (res.assets && res.assets[0]?.uri) {
            setPickedUri(res.assets[0].uri);
        }
    };

    const saveUpload = async () => {
        if (!name.trim()) { Alert.alert('Name required', 'Please enter a name.'); return; }
        if (!pickedUri) { Alert.alert('Image required', 'Please pick an image.'); return; }

        setUploading(true);
        try {
            // 1. Upload to Supabase Storage
            const filename = `${Date.now()}_${name.replace(/\s+/g, '_')}.jpg`;
            const downloadUrl = await uploadToSupabase(pickedUri, filename);

            // 2. Save Item to Supabase
            const newItemMeta = {
                name: name.trim(),
                category: selCat,
                uri: downloadUrl, // Global Cloud URL
                createdAt: new Date().toISOString(),
                modelUrl: downloadUrl, // For now, image is the model in simple AR
                modelType: 'IMAGE_PLANE'
            };

            await saveItemToSupabase(newItemMeta);

            // Success!
            setAdding(false);
            setName('');
            setPickedUri(null);
            Alert.alert('✅ Success!', `"${name}" is now live for all students.`);
            refreshItems();
        } catch (err) {
            console.error("Upload Failed:", err);
            Alert.alert('❌ Error', 'Could not upload to cloud. Please check your config.');
        } finally {
            setUploading(false);
        }
    };

    const deleteItem = async (id: string, storageUri?: string) => {
        Alert.alert('Delete', 'Remove from cloud?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        // Delete Supabase entry
                        await supabase.from('ar_content').delete().eq('id', id);
                        refreshItems();
                    } catch (err) {
                        Alert.alert('Error', 'Delete failed.');
                    }
                }
            },
        ]);
    };

    const catColor = CATS.find(c => c.id === selCat)?.color || '#6c63ff';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📤 Content Manager</Text>
                <TouchableOpacity onPress={() => setAdding(true)} style={[styles.addBtn, { backgroundColor: catColor }]}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {/* Category filter tabs */}
            <View style={styles.catRow}>
                {CATS.map(c => (
                    <TouchableOpacity
                        key={c.id}
                        style={[styles.catTab, selCat === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                        onPress={() => setSelCat(c.id)}>
                        <Text style={styles.catEmoji}>{c.emoji}</Text>
                        <Text style={[styles.catLabel, selCat === c.id && { color: '#fff' }]}>{c.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Items list */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                {items.filter(i => i.category === selCat).length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>{CATS.find(c => c.id === selCat)?.emoji}</Text>
                        <Text style={styles.emptyText}>No {selCat} content yet.</Text>
                        <Text style={styles.emptyHint}>Tap "+ Add" to upload one!</Text>
                    </View>
                ) : items.filter(i => i.category === selCat).map(item => (
                    <View key={item.id} style={styles.itemCard}>
                        <Image source={{ uri: item.uri }} style={styles.itemThumb} resizeMode="cover" />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemMeta}>{item.category} • {item.createdAt}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
                            <Text style={styles.deleteTxt}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add modal overlay */}
            {adding && (
                <View style={styles.modal}>
                    <Animated.View style={[styles.modalCard, { transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.modalTitle}>Add New AR Content</Text>

                        {/* Category selector */}
                        <View style={styles.modalCats}>
                            {CATS.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.modalCatBtn, selCat === c.id && { backgroundColor: c.color }]}
                                    onPress={() => setSelCat(c.id)}>
                                    <Text style={styles.modalCatEmoji}>{c.emoji}</Text>
                                    <Text style={[styles.modalCatText, selCat === c.id && { color: '#fff' }]}>{c.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Name input */}
                        <Text style={styles.modalLabel}>Name / Label</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={`e.g. "Letter A Apple" or "Number 3"`}
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            value={name}
                            onChangeText={setName}
                        />

                        {/* Image picker */}
                        <TouchableOpacity style={styles.pickerBtn} onPress={pickImage} activeOpacity={0.8}>
                            {pickedUri
                                ? <Image source={{ uri: pickedUri }} style={styles.pickedPreview} resizeMode="cover" />
                                : <>
                                    <Text style={styles.pickerIcon}>🖼️</Text>
                                    <Text style={styles.pickerText}>Tap to pick from Gallery</Text>
                                </>
                            }
                        </TouchableOpacity>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAdding(false); setPickedUri(null); setName(''); }}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: catColor }]} onPress={saveUpload}>
                                <Text style={styles.saveBtnText}>Save to AR ✓</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07071a' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    backText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    addBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    catRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 12 },
    catTab: {
        flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', gap: 3,
        backgroundColor: 'rgba(255,255,255,0.04)'
    },
    catEmoji: { fontSize: 18 },
    catLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700' },
    list: { paddingHorizontal: 16 },
    empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyEmoji: { fontSize: 52 },
    emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '700' },
    emptyHint: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
    itemCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)'
    },
    itemThumb: { width: 70, height: 70 },
    itemInfo: { flex: 1, paddingHorizontal: 12 },
    itemName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    itemMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    deleteBtn: { padding: 14 },
    deleteTxt: { fontSize: 20 },
    modal: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end'
    },
    modalCard: {
        backgroundColor: '#0f0f2a', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
    modalCats: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    modalCatBtn: {
        flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', gap: 3,
        backgroundColor: 'rgba(255,255,255,0.04)'
    },
    modalCatEmoji: { fontSize: 20 },
    modalCatText: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700' },
    modalLabel: {
        color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, color: '#fff', fontSize: 15, marginBottom: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)'
    },
    pickerBtn: {
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, height: 120,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', marginBottom: 20, overflow: 'hidden'
    },
    pickerIcon: { fontSize: 36, marginBottom: 8 },
    pickerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    pickedPreview: { width: '100%', height: '100%' },
    modalActions: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center'
    },
    cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
