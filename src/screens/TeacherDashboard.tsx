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
    onUpload: () => void;
    onARUpload: () => void;    // NEW: navigate to 3D AR upload screen
    userName?: string;
};

const TABS = ['Classes', 'Students', 'Tasks'];

const CLASSES = [
    { name: 'Grade 1 - A', students: 24, color: '#6c63ff', progress: 72 },
    { name: 'Grade 2 - B', students: 19, color: '#ff6584', progress: 55 },
    { name: 'KG - C', students: 30, color: '#43b89c', progress: 88 },
];

const STUDENTS = [
    { name: 'Aarav Sharma', grade: 'Grade 1', score: 92, emoji: '👦' },
    { name: 'Priya Mehta', grade: 'Grade 2', score: 85, emoji: '👧' },
    { name: 'Rahul Singh', grade: 'KG', score: 78, emoji: '👦' },
    { name: 'Ananya Patel', grade: 'Grade 1', score: 96, emoji: '👧' },
    { name: 'Rohan Gupta', grade: 'Grade 2', score: 61, emoji: '👦' },
];

const TASKS = [
    { emoji: '📋', label: 'Create New Lesson', color: '#6c63ff', desc: 'Add AR content for alphabets' },
    { emoji: '📝', label: 'Create Quiz', color: '#ff6584', desc: '10 MCQs for Grade 1' },
    { emoji: '🧊', label: 'Upload AR Model', color: '#8b5cf6', desc: 'Upload .GLB/.GLTF 3D files for students' },
    { emoji: '✅', label: 'Assign Homework', color: '#f59e0b', desc: 'Assign to selected students' },
    { emoji: '📊', label: 'Generate Reports', color: '#8b5cf6', desc: 'Class performance PDF' },
    { emoji: '🔔', label: 'Send Notification', color: '#06b6d4', desc: 'Alert students & parents' },
];

export default function TeacherDashboard({ onBack, onUpload, onARUpload, userName = 'Teacher' }: Props) {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState(0);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Text style={styles.backText}>⏻ Logout</Text>
                </TouchableOpacity>
                <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>👩‍🏫 TEACHER</Text>
                </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcome}>
                <Text style={styles.greeting}>Welcome, {userName} 👋</Text>
                <Text style={styles.welcomeName}>Teacher Portal</Text>
            </View>

            {/* Summary Row */}
            <View style={styles.statsRow}>
                {[
                    { emoji: '👥', value: '73', label: 'Students' },
                    { emoji: '📚', value: '3', label: 'Classes' },
                    { emoji: '✅', value: '8', label: 'Tasks Due' },
                    { emoji: '📊', value: '72%', label: 'Avg Score' },
                ].map(s => (
                    <View key={s.label} style={styles.statCard}>
                        <Text style={styles.statEmoji}>{s.emoji}</Text>
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === i && styles.tabActive]}
                        onPress={() => setActiveTab(i)}>
                        <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Classes Tab */}
                {activeTab === 0 && CLASSES.map(cls => (
                    <TouchableOpacity key={cls.name} style={styles.classCard} activeOpacity={0.8}>
                        <View style={styles.classTop}>
                            <View style={[styles.classDot, { backgroundColor: cls.color }]} />
                            <Text style={styles.className}>{cls.name}</Text>
                            <Text style={styles.classCount}>{cls.students} students</Text>
                        </View>
                        {/* Progress bar */}
                        <View style={styles.progressBg}>
                            <View style={[styles.progressFill, { width: `${cls.progress}%` as any, backgroundColor: cls.color }]} />
                        </View>
                        <Text style={styles.progressText}>{cls.progress}% lesson progress</Text>
                    </TouchableOpacity>
                ))}

                {/* Students Tab */}
                {activeTab === 1 && STUDENTS.map(s => (
                    <TouchableOpacity key={s.name} style={styles.studentCard} activeOpacity={0.8}>
                        <View style={styles.studentAvatar}>
                            <Text style={styles.avatarEmoji}>{s.emoji}</Text>
                        </View>
                        <View style={styles.studentInfo}>
                            <Text style={styles.studentName}>{s.name}</Text>
                            <Text style={styles.studentGrade}>{s.grade}</Text>
                        </View>
                        <View style={[styles.scoreBadge, { backgroundColor: s.score >= 80 ? '#10b98122' : '#f59e0b22' }]}>
                            <Text style={[styles.scoreText, { color: s.score >= 80 ? '#10b981' : '#f59e0b' }]}>
                                {s.score}%
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Tasks Tab */}
                {activeTab === 2 && TASKS.map(task => (
                    <TouchableOpacity
                        key={task.label}
                        style={[
                            styles.taskCard,
                            task.label === 'Upload AR Model' && {
                                borderColor: '#8b5cf6',
                                borderWidth: 2,
                                backgroundColor: 'rgba(139,92,246,0.08)',
                            },
                        ]}
                        activeOpacity={0.8}
                        onPress={task.label === 'Upload AR Model' ? onARUpload : undefined}>
                        <View style={[styles.taskIcon, { backgroundColor: task.color + '22' }]}>
                            <Text style={styles.taskEmoji}>{task.emoji}</Text>
                        </View>
                        <View style={styles.taskText}>
                            <Text style={[
                                styles.taskLabel,
                                task.label === 'Upload AR Model' && { color: '#c4b5fd' },
                            ]}>{task.label}</Text>
                            <Text style={styles.taskDesc}>{task.desc}</Text>
                        </View>
                        <Text style={[styles.arrow, { color: task.color }]}>›</Text>
                    </TouchableOpacity>
                ))}

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
    rolePill: {
        backgroundColor: '#ff658422',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ff658455',
    },
    rolePillText: { color: '#ff8fa3', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    welcome: { paddingHorizontal: 20, paddingBottom: 16 },
    greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 },
    welcomeName: { color: '#fff', fontSize: 26, fontWeight: '900' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 3,
    },
    statEmoji: { fontSize: 18 },
    statValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
    statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#ff6584' },
    tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
    tabTextActive: { color: '#fff', fontWeight: '700' },
    scroll: { paddingHorizontal: 20 },
    classCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 10,
    },
    classTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    classDot: { width: 10, height: 10, borderRadius: 5 },
    className: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 },
    classCount: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
    progressFill: { height: 6, borderRadius: 3 },
    progressText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 12,
    },
    studentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarEmoji: { fontSize: 22 },
    studentInfo: { flex: 1 },
    studentName: { color: '#fff', fontSize: 15, fontWeight: '700' },
    studentGrade: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    scoreText: { fontSize: 14, fontWeight: '800' },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        gap: 12,
    },
    taskIcon: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    taskEmoji: { fontSize: 22 },
    taskText: { flex: 1 },
    taskLabel: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    taskDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    arrow: { fontSize: 26, fontWeight: '700' },
});
