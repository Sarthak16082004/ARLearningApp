/**
 * ARProjectsScreen.tsx
 * Student-facing screen: lists teacher-uploaded AR projects in real-time.
 * Selecting a project opens the AR viewer with the Firebase model URL.
 */
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    subscribeToProjects,
    ARProject,
    ARCategory,
} from '../services/arProjectService';
import { ARObject } from './student/ARViewScreen';

type Props = {
    onBack: () => void;
    onSelectProject: (obj: ARObject) => void;
};

const CATEGORIES: { id: ARCategory | 'all'; label: string; emoji: string; color: string }[] = [
    { id: 'all', label: 'All', emoji: '🌟', color: '#6c63ff' },
    { id: 'alphabet', label: 'Alphabet', emoji: '🔤', color: '#6c63ff' },
    { id: 'numbers', label: 'Numbers', emoji: '🔢', color: '#ff6584' },
    { id: 'shapes', label: 'Shapes', emoji: '🔷', color: '#43b89c' },
    { id: 'animals', label: 'Animals', emoji: '🦁', color: '#f59e0b' },
    { id: 'custom', label: 'Custom', emoji: '✨', color: '#8b5cf6' },
];

export default function ARProjectsScreen({ onBack, onSelectProject }: Props) {
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState<ARProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCat, setFilterCat] = useState<ARCategory | 'all'>('all');

    useEffect(() => {
        // Real-time listener — updates instantly when teacher adds content
        const unsubscribe = subscribeToProjects(data => {
            setProjects(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const displayed = filterCat === 'all'
        ? projects
        : projects.filter(p => p.category === filterCat);

    const getCat = (id: string) =>
        CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];

    const handleSelect = (project: ARProject) => {
        const obj: ARObject = {
            id: project.id,
            name: project.title,
            category: project.category,
            modelUrl: project.modelUrl,
            modelType: project.modelType,
        };
        onSelectProject(obj);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>✨ AR Projects</Text>
                    <Text style={styles.headerSub}>
                        {loading ? 'Loading...' : `${projects.length} model${projects.length !== 1 ? 's' : ''} available`}
                    </Text>
                </View>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
            </View>

            {/* ── Category Filter ── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}>
                {CATEGORIES.map(c => (
                    <TouchableOpacity
                        key={c.id}
                        style={[
                            styles.filterChip,
                            filterCat === c.id && { backgroundColor: c.color, borderColor: c.color },
                        ]}
                        onPress={() => setFilterCat(c.id as ARCategory | 'all')}>
                        <Text style={styles.filterEmoji}>{c.emoji}</Text>
                        <Text style={[styles.filterText, filterCat === c.id && { color: '#fff' }]}>
                            {c.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* ── Content ── */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color="#6c63ff" size="large" />
                    <Text style={styles.loadingText}>Fetching AR content...</Text>
                </View>
            ) : displayed.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyEmoji}>🌌</Text>
                    <Text style={styles.emptyTitle}>No AR projects yet</Text>
                    <Text style={styles.emptyHint}>Your teacher hasn't uploaded any models yet. Check back soon!</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.grid}>
                    {displayed.map(project => {
                        const cat = getCat(project.category);
                        return (
                            <TouchableOpacity
                                key={project.id}
                                style={styles.card}
                                onPress={() => handleSelect(project)}
                                activeOpacity={0.82}>

                                {/* Icon area */}
                                <View style={[styles.cardIcon, { backgroundColor: cat.color + '18' }]}>
                                    <Text style={styles.cardEmoji}>{cat.emoji}</Text>
                                    <View style={[styles.typePill, { backgroundColor: cat.color }]}>
                                        <Text style={styles.typePillText}>{project.modelType}</Text>
                                    </View>
                                </View>

                                {/* Info */}
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{project.title}</Text>
                                    {project.description ? (
                                        <Text style={styles.cardDesc} numberOfLines={2}>{project.description}</Text>
                                    ) : null}
                                    <Text style={styles.cardMeta}>
                                        👩‍🏫 {project.teacherName}
                                    </Text>
                                </View>

                                {/* Launch button */}
                                <View style={[styles.launchBtn, { backgroundColor: cat.color }]}>
                                    <Text style={styles.launchText}>▶ View in AR</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07071a' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    backBtn: {
        backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    backText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
    headerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' },
    liveBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 6,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
    },
    liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10b981' },
    liveText: { color: '#10b981', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    filterRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 14 },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    filterEmoji: { fontSize: 14 },
    filterText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14, paddingHorizontal: 32 },
    loadingText: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
    emptyEmoji: { fontSize: 58 },
    emptyTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 18, fontWeight: '800' },
    emptyHint: { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
    grid: { paddingHorizontal: 16, paddingTop: 4 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, marginBottom: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden',
    },
    cardIcon: {
        height: 110, justifyContent: 'center', alignItems: 'center',
        position: 'relative',
    },
    cardEmoji: { fontSize: 52 },
    typePill: {
        position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    typePillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    cardInfo: { padding: 14, gap: 4 },
    cardTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
    cardDesc: { color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 18 },
    cardMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },
    launchBtn: {
        marginHorizontal: 14, marginBottom: 14, paddingVertical: 13,
        borderRadius: 14, alignItems: 'center',
    },
    launchText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
