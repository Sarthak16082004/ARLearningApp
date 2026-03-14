import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    onBack: () => void;
    onStartAR: (category: string) => void;
    onViewProjects?: () => void; // Keeping prop optional to avoid breaking App.tsx if still passed
    userName?: string;
};

const AR_LESSONS = [
    { id: 'alphabet', label: 'Alphabets A–Z', emoji: '🔤', color: '#6c63ff', sub: 'Learn all 26 letters in AR' },
    { id: 'numbers', label: 'Numbers 0–9', emoji: '🔢', color: '#ff6584', sub: 'Count with AR animation' },
    { id: 'shapes', label: 'Shapes', emoji: '🔷', color: '#43b89c', sub: 'Circle, Square, Triangle & more' },
    { id: 'animals', label: 'Animals', emoji: '🦁', color: '#f59e0b', sub: 'Meet AR animals!' },
];

const QUICK_TASKS = [
    { emoji: '📝', label: 'Take a Quiz', color: '#8b5cf6', desc: '10 questions • 5 mins' },
    { emoji: '📊', label: 'My Progress', color: '#06b6d4', desc: 'View your learning stats' },
    { emoji: '🏆', label: 'Achievements', color: '#f59e0b', desc: '3 badges earned' },
    { emoji: '📅', label: 'Daily Goal', color: '#10b981', desc: '2 of 3 lessons done' },
];

export default function StudentDashboard({ onBack, onStartAR, onViewProjects, userName = 'Student' }: Props) {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'learn' | 'tasks'>('learn');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>⏻ Logout</Text>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <View style={styles.rolePill}>
                        <Text style={styles.rolePillText}>🎒 STUDENT</Text>
                    </View>
                </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcome}>
                <Text style={styles.greeting}>Welcome, {userName} 👋</Text>
                <Text style={styles.welcomeName}>Ready to learn today?</Text>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                {[
                    { label: 'Streak', value: '7 days', emoji: '🔥' },
                    { label: 'Lessons', value: '12 done', emoji: '📚' },
                    { label: 'Score', value: '94%', emoji: '⭐' },
                ].map(s => (
                    <View key={s.label} style={styles.statCard}>
                        <Text style={styles.statEmoji}>{s.emoji}</Text>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Tab switcher */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'learn' && styles.tabActive]}
                    onPress={() => setActiveTab('learn')}>
                    <Text style={[styles.tabText, activeTab === 'learn' && styles.tabTextActive]}>
                        AR Lessons
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
                    onPress={() => setActiveTab('tasks')}>
                    <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
                        My Tasks
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {activeTab === 'learn' ? (
                    <>
                        <Text style={styles.sectionTitle}>Choose an AR Lesson</Text>
                        {AR_LESSONS.map(lesson => (
                            <TouchableOpacity
                                key={lesson.id}
                                style={styles.lessonCard}
                                onPress={() => onStartAR(lesson.id)}
                                activeOpacity={0.8}>
                                <View style={[styles.lessonIcon, { backgroundColor: lesson.color + '22' }]}>
                                    <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                                </View>
                                <View style={styles.lessonText}>
                                    <Text style={styles.lessonLabel}>{lesson.label}</Text>
                                    <Text style={styles.lessonSub}>{lesson.sub}</Text>
                                </View>
                                <View style={[styles.startBtn, { backgroundColor: lesson.color }]}>
                                    <Text style={styles.startBtnText}>Start AR</Text>
                                </View>
                            </TouchableOpacity>
                        ))}


                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Your Tasks</Text>
                        {QUICK_TASKS.map(task => (
                            <TouchableOpacity key={task.label} style={styles.taskCard} activeOpacity={0.8}>
                                <View style={[styles.taskIcon, { backgroundColor: task.color + '22' }]}>
                                    <Text style={styles.taskEmoji}>{task.emoji}</Text>
                                </View>
                                <View style={styles.taskText}>
                                    <Text style={styles.taskLabel}>{task.label}</Text>
                                    <Text style={styles.taskDesc}>{task.desc}</Text>
                                </View>
                                <Text style={[styles.taskArrow, { color: task.color }]}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#07071a' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
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
    headerRight: {},
    rolePill: {
        backgroundColor: '#6c63ff22',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6c63ff55',
    },
    rolePillText: { color: '#a78bfa', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    welcome: { paddingHorizontal: 20, paddingBottom: 16 },
    greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 },
    welcomeName: { color: '#fff', fontSize: 26, fontWeight: '900' },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 4,
    },
    statEmoji: { fontSize: 20 },
    statValue: { color: '#fff', fontSize: 15, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#6c63ff' },
    tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    scroll: { paddingHorizontal: 20 },
    sectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 12,
    },
    lessonIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    lessonEmoji: { fontSize: 24 },
    lessonText: { flex: 1 },
    lessonLabel: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
    lessonSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    startBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
    startBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 12,
    },
    taskIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    taskEmoji: { fontSize: 24 },
    taskText: { flex: 1 },
    taskLabel: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2 },
    taskDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    taskArrow: { fontSize: 28, fontWeight: '700' },
});
