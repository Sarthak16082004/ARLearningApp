/**
 * ARUploadScreen.tsx
 * Teacher-facing screen to upload 3D models (.glb/.gltf/.obj) to Supabase.
 * Features:
 *  - File picker via react-native-document-picker
 *  - Real-time upload progress bar
 *  - Firestore metadata save
 *  - List of existing projects with delete
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Alert, Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {
    uploadAndSaveProject,
    deleteProject,
    fetchProjects,
    ARProject,
    ARCategory,
    ARModelType,
} from '../services/arProjectService';

type Props = {
    onBack: () => void;
    teacherName?: string;
};

const CATEGORIES: { id: ARCategory; label: string; emoji: string; color: string }[] = [
    { id: 'alphabet', label: 'Alphabet', emoji: '🔤', color: '#6c63ff' },
    { id: 'numbers', label: 'Numbers', emoji: '🔢', color: '#ff6584' },
    { id: 'shapes', label: 'Shapes', emoji: '🔷', color: '#43b89c' },
    { id: 'animals', label: 'Animals', emoji: '🦁', color: '#f59e0b' },
    { id: 'custom', label: 'Custom', emoji: '✨', color: '#8b5cf6' },
];

const MODEL_TYPES: ARModelType[] = ['GLB', 'GLTF', 'OBJ'];

export default function ARUploadScreen({ onBack, teacherName = 'Teacher' }: Props) {
    const insets = useSafeAreaInsets();

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selCat, setSelCat] = useState<ARCategory>('custom');
    const [selType, setSelType] = useState<ARModelType>('GLB');
    const [pickedFile, setPickedFile] = useState<{ name: string; uri: string; size?: number } | null>(null);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Project list
    const [projects, setProjects] = useState<ARProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [filterCat, setFilterCat] = useState<ARCategory | 'all'>('all');

    // Modal visibility
    const [showForm, setShowForm] = useState(false);
    const slideAnim = useRef(new Animated.Value(600)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // ── Lifecycle ──────────────────────────────────────────────
    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const loadProjects = async () => {
        setLoadingProjects(true);
        const data = await fetchProjects();
        setProjects(data);
        setLoadingProjects(false);
    };

    // ── Form handlers ──────────────────────────────────────────
    const openForm = () => {
        setShowForm(true);
        Animated.spring(slideAnim, {
            toValue: 0, useNativeDriver: true, tension: 55, friction: 9,
        }).start();
    };

    const closeForm = () => {
        Animated.timing(slideAnim, {
            toValue: 600, duration: 280, useNativeDriver: true,
        }).start(() => {
            setShowForm(false);
            resetForm();
        });
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelCat('custom');
        setSelType('GLB');
        setPickedFile(null);
        setProgress(0);
    };

    // ── File picker ────────────────────────────────────────────
    const pickFile = async () => {
        try {
            const [result] = await pick({
                type: [types.allFiles],
            });

            // Validate extension
            const name = result.name || '';
            const ext = name.split('.').pop()?.toUpperCase();
            if (!['GLB', 'GLTF', 'OBJ'].includes(ext || '')) {
                Alert.alert(
                    '❌ Unsupported File',
                    'Please select a .glb, .gltf, or .obj file.',
                );
                return;
            }

            setPickedFile({
                name,
                uri: result.uri,   // content:// URI — works with Supabase upload
                size: result.size ?? undefined,
            });

            // Auto-detect model type
            if (ext) setSelType(ext as ARModelType);
        } catch (err) {
            if (!isErrorWithCode(err) || err.code !== errorCodes.OPERATION_CANCELED) {
                Alert.alert('Error', 'Could not open file picker.');
            }
        }
    };

    // ── Upload ─────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a title for this model.');
            return;
        }
        if (!pickedFile) {
            Alert.alert('Required', 'Please select a 3D model file first.');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            await uploadAndSaveProject(
                {
                    localFilePath: pickedFile.uri,
                    fileName: pickedFile.name,
                    title: title.trim(),
                    description: description.trim(),
                    category: selCat,
                    modelType: selType,
                    teacherName,
                },
                pct => setProgress(pct),
            );

            Alert.alert(
                '🎉 Uploaded!',
                `"${title}" is now live and students can see it instantly.`,
            );
            closeForm();
            loadProjects();
        } catch (err) {
            console.error('Upload error:', err);
            Alert.alert('❌ Upload Failed', `Error: ${err instanceof Error ? err.message : String(err)}\nCheck connection & rules.`);
        } finally {
            setUploading(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = (project: ARProject) => {
        Alert.alert(
            'Delete Project',
            `Remove "${project.title}" from the cloud? Students will no longer see it.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                            await deleteProject(project.id, project.modelUrl);
                            setProjects(prev => prev.filter(p => p.id !== project.id));
                        } catch {
                            Alert.alert('Error', 'Delete failed. Try again.');
                        }
                    },
                },
            ],
        );
    };

    // ── Helpers ────────────────────────────────────────────────
    const catColor = CATEGORIES.find(c => c.id === selCat)?.color || '#6c63ff';
    const filteredProjects = filterCat === 'all'
        ? projects
        : projects.filter(p => p.category === filterCat);

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        return bytes > 1_000_000
            ? `${(bytes / 1_000_000).toFixed(1)} MB`
            : `${Math.round(bytes / 1000)} KB`;
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    // ── Render ─────────────────────────────────────────────────
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🧊 AR Projects</Text>
                <TouchableOpacity onPress={openForm} style={styles.uploadBtn}>
                    <Text style={styles.uploadBtnText}>+ Upload</Text>
                </TouchableOpacity>
            </View>

            {/* ── Category Filter ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterChip, filterCat === 'all' && styles.filterChipActive]}
                    onPress={() => setFilterCat('all')}>
                    <Text style={[styles.filterText, filterCat === 'all' && { color: '#fff' }]}>All</Text>
                </TouchableOpacity>
                {CATEGORIES.map(c => (
                    <TouchableOpacity
                        key={c.id}
                        style={[styles.filterChip, filterCat === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                        onPress={() => setFilterCat(c.id)}>
                        <Text style={styles.filterEmoji}>{c.emoji}</Text>
                        <Text style={[styles.filterText, filterCat === c.id && { color: '#fff' }]}>{c.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* ── Project List ── */}
            {loadingProjects ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#6c63ff" size="large" />
                    <Text style={styles.loadingText}>Loading projects...</Text>
                </View>
            ) : filteredProjects.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyEmoji}>📭</Text>
                    <Text style={styles.emptyText}>No AR projects yet.</Text>
                    <Text style={styles.emptyHint}>Tap "+ Upload" to add the first one!</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.projectList}>
                    {filteredProjects.map(project => {
                        const cat = CATEGORIES.find(c => c.id === project.category);
                        return (
                            <View key={project.id} style={styles.projectCard}>
                                {/* Left accent */}
                                <View style={[styles.accentBar, { backgroundColor: cat?.color || '#6c63ff' }]} />

                                <View style={styles.cardContent}>
                                    {/* Header row */}
                                    <View style={styles.cardTop}>
                                        <View style={[styles.catBadge, { backgroundColor: (cat?.color || '#6c63ff') + '22' }]}>
                                            <Text style={styles.catBadgeEmoji}>{cat?.emoji}</Text>
                                            <Text style={[styles.catBadgeText, { color: cat?.color }]}>
                                                {project.modelType}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDelete(project)} style={styles.deleteBtn}>
                                            <Text style={styles.deleteTxt}>🗑️</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Title */}
                                    <Text style={styles.projectTitle}>{project.title}</Text>
                                    {project.description ? (
                                        <Text style={styles.projectDesc}>{project.description}</Text>
                                    ) : null}

                                    {/* Meta */}
                                    <Text style={styles.projectMeta}>
                                        👩‍🏫 {project.teacherName}  •  {new Date(project.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}

            {/* ── Upload Form Modal ── */}
            {showForm && (
                <View style={styles.overlay}>
                    <TouchableOpacity style={styles.overlayBg} onPress={closeForm} activeOpacity={1} />
                    <Animated.View style={[styles.formCard, { transform: [{ translateY: slideAnim }] }]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.formTitle}>Upload 3D Model</Text>

                            {/* ─ File Picker ─ */}
                            <TouchableOpacity
                                style={[styles.filePicker, pickedFile && styles.filePickerActive]}
                                onPress={pickFile}
                                activeOpacity={0.8}>
                                {pickedFile ? (
                                    <>
                                        <Text style={styles.filePickerIcon}>📦</Text>
                                        <Text style={styles.filePickedName} numberOfLines={1}>{pickedFile.name}</Text>
                                        <Text style={styles.filePickedSize}>{formatSize(pickedFile.size)}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.filePickerIcon}>📁</Text>
                                        <Text style={styles.filePickerText}>Tap to select .GLB / .GLTF / .OBJ</Text>
                                        <Text style={styles.filePickerHint}>3D model file from your phone</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* ─ Title ─ */}
                            <Text style={styles.fieldLabel}>Title *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder='e.g. "Tiger 3D Model"'
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                value={title}
                                onChangeText={setTitle}
                            />

                            {/* ─ Description ─ */}
                            <Text style={styles.fieldLabel}>Description (optional)</Text>
                            <TextInput
                                style={[styles.input, styles.inputMulti]}
                                placeholder="Short description for students..."
                                placeholderTextColor="rgba(255,255,255,0.22)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />

                            {/* ─ Category ─ */}
                            <Text style={styles.fieldLabel}>Category</Text>
                            <View style={styles.chipRow}>
                                {CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c.id}
                                        style={[styles.chip, selCat === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                                        onPress={() => setSelCat(c.id)}>
                                        <Text style={styles.chipEmoji}>{c.emoji}</Text>
                                        <Text style={[styles.chipText, selCat === c.id && { color: '#fff' }]}>{c.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* ─ Model Type ─ */}
                            <Text style={styles.fieldLabel}>File Format</Text>
                            <View style={styles.typeRow}>
                                {MODEL_TYPES.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeChip, selType === t && { backgroundColor: catColor, borderColor: catColor }]}
                                        onPress={() => setSelType(t)}>
                                        <Text style={[styles.typeText, selType === t && { color: '#fff' }]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* ─ Progress Bar ─ */}
                            {uploading && (
                                <View style={styles.progressContainer}>
                                    <Text style={styles.progressLabel}>Uploading... {progress}%</Text>
                                    <View style={styles.progressBg}>
                                        <Animated.View style={[styles.progressFill, {
                                            width: progressWidth, backgroundColor: catColor,
                                        }]} />
                                    </View>
                                </View>
                            )}

                            {/* ─ Actions ─ */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={closeForm}
                                    disabled={uploading}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: catColor }, uploading && { opacity: 0.7 }]}
                                    onPress={handleUpload}
                                    disabled={uploading}>
                                    {uploading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.submitText}>🚀 Upload to Cloud</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    backText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
    uploadBtn: {
        backgroundColor: '#6c63ff', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 20,
    },
    uploadBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
    filterRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 12 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    filterChipActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
    filterEmoji: { fontSize: 14 },
    filterText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    emptyEmoji: { fontSize: 52 },
    emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 17, fontWeight: '700' },
    emptyHint: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },
    projectList: { paddingHorizontal: 16, paddingTop: 4 },
    projectCard: {
        flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16, marginBottom: 10, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    },
    accentBar: { width: 4 },
    cardContent: { flex: 1, padding: 14, gap: 6 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    catBadgeEmoji: { fontSize: 13 },
    catBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    deleteBtn: { padding: 4 },
    deleteTxt: { fontSize: 18 },
    projectTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    projectDesc: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 18 },
    projectMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
    overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    formCard: {
        backgroundColor: '#0f0f2a', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        maxHeight: '90%',
    },
    formTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    filePicker: {
        borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16, padding: 28, alignItems: 'center', marginBottom: 20, gap: 8,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    filePickerActive: { borderColor: '#6c63ff', backgroundColor: 'rgba(108,99,255,0.08)' },
    filePickerIcon: { fontSize: 38 },
    filePickerText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    filePickerHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
    filePickedName: { color: '#fff', fontSize: 14, fontWeight: '700', maxWidth: '90%', textAlign: 'center' },
    filePickedSize: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
    fieldLabel: {
        color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, color: '#fff', fontSize: 15, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    inputMulti: { height: 80, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    chipEmoji: { fontSize: 15 },
    chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    typeChip: {
        flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    typeText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '800' },
    progressContainer: { marginBottom: 16, gap: 8 },
    progressLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', textAlign: 'center' },
    progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: 8, borderRadius: 4 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 4, paddingBottom: 8 },
    cancelBtn: {
        flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center',
    },
    cancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '700' },
    submitBtn: { flex: 2, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
    submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
