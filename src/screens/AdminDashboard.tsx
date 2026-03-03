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
    userName?: string;
};

const TABS = ['Overview', 'Users', 'Settings'];

const METRICS = [
    { emoji: '👤', value: '142', label: 'Total Users', color: '#6c63ff' },
    { emoji: '👩‍🏫', value: '8', label: 'Teachers', color: '#ff6584' },
    { emoji: '🎒', value: '130', label: 'Students', color: '#43b89c' },
    { emoji: '📚', value: '24', label: 'Lessons', color: '#f59e0b' },
];

const ACTIVITY = [
    { emoji: '✅', text: 'New teacher "Ms. Patel" registered', time: '2m ago', color: '#10b981' },
    { emoji: '⚠️', text: 'Student "Rahul" reported an issue', time: '15m ago', color: '#f59e0b' },
    { emoji: '📤', text: 'New content uploaded by Teacher A', time: '1h ago', color: '#6c63ff' },
    { emoji: '🔔', text: 'System backup completed', time: '3h ago', color: '#43b89c' },
    { emoji: '🛡️', text: 'Security scan passed (0 threats)', time: '6h ago', color: '#06b6d4' },
];

const USERS = [
    { name: 'Ms. Priya Sharma', role: 'Teacher', status: 'Active', emoji: '👩‍🏫', color: '#ff6584' },
    { name: 'Aarav Singh', role: 'Student', status: 'Active', emoji: '👦', color: '#43b89c' },
    { name: 'Mr. Rohan Das', role: 'Teacher', status: 'Inactive', emoji: '👨‍🏫', color: '#f59e0b' },
    { name: 'Ananya Patel', role: 'Student', status: 'Active', emoji: '👧', color: '#43b89c' },
    { name: 'Ms. Kavya Iyer', role: 'Teacher', status: 'Active', emoji: '👩‍🏫', color: '#ff6584' },
];

const SETTINGS = [
    { emoji: '📚', label: 'Content Management', desc: 'Add, edit or remove AR lessons', color: '#6c63ff' },
    { emoji: '🔔', label: 'Push Notifications', desc: 'Manage alerts for all users', color: '#f59e0b' },
    { emoji: '🛡️', label: 'Security & Permissions', desc: 'Role-based access control', color: '#ff6584' },
    { emoji: '📊', label: 'Analytics & Reports', desc: 'Download usage statistics', color: '#43b89c' },
    { emoji: '🔧', label: 'App Configuration', desc: 'Version, theme, cache settings', color: '#8b5cf6' },
    { emoji: '💾', label: 'Database Backup', desc: 'Schedule or manual backup', color: '#06b6d4' },
];

export default function AdminDashboard({ onBack, onUpload, userName = 'Admin' }: Props) {
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
                    <Text style={styles.rolePillText}>🛡️ ADMIN</Text>
                </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcome}>
                <Text style={styles.greeting}>Welcome, {userName} 👋</Text>
                <Text style={styles.welcomeName}>Admin Control Center</Text>
            </View>

            {/* Metrics */}
            <View style={styles.metricsGrid}>
                {METRICS.map(m => (
                    <View key={m.label} style={[styles.metricCard, { borderColor: m.color + '33' }]}>
                        <Text style={styles.metricEmoji}>{m.emoji}</Text>
                        <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                        <Text style={styles.metricLabel}>{m.label}</Text>
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

                {/* Overview Tab - Recent Activity */}
                {activeTab === 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        {ACTIVITY.map((a, i) => (
                            <View key={i} style={styles.activityCard}>
                                <View style={[styles.activityDot, { backgroundColor: a.color }]} />
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityText}>{a.text}</Text>
                                    <Text style={styles.activityTime}>{a.time}</Text>
                                </View>
                                <Text style={styles.activityEmoji}>{a.emoji}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 1 && (
                    <>
                        <Text style={styles.sectionTitle}>All Users</Text>
                        <TouchableOpacity style={styles.addUserBtn}>
                            <Text style={styles.addUserText}>+ Add New User</Text>
                        </TouchableOpacity>
                        {USERS.map(u => (
                            <View key={u.name} style={styles.userCard}>
                                <View style={[styles.userAvatar, { backgroundColor: u.color + '22' }]}>
                                    <Text style={styles.userEmoji}>{u.emoji}</Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{u.name}</Text>
                                    <Text style={styles.userRole}>{u.role}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: u.status === 'Active' ? '#10b98122' : '#6b728022' },
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: u.status === 'Active' ? '#10b981' : '#6b7280' },
                                    ]}>
                                        {u.status}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {/* Settings Tab */}
                {activeTab === 2 && (
                    <>
                        <Text style={styles.sectionTitle}>System Settings</Text>
                        {SETTINGS.map(s => (
                            <TouchableOpacity
                                key={s.label}
                                style={styles.settingCard}
                                activeOpacity={0.8}
                                onPress={s.label === 'Content Management' ? onUpload : undefined}>
                                <View style={[styles.settingIcon, { backgroundColor: s.color + '22' }]}>
                                    <Text style={styles.settingEmoji}>{s.emoji}</Text>
                                </View>
                                <View style={styles.settingText}>
                                    <Text style={styles.settingLabel}>{s.label}</Text>
                                    <Text style={styles.settingDesc}>{s.label === 'Content Management' ? 'Upload custom AR content from gallery' : s.desc}</Text>
                                </View>
                                <Text style={[styles.arrow, { color: s.color }]}>›</Text>
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
    rolePill: {
        backgroundColor: '#43b89c22',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#43b89c55',
    },
    rolePillText: { color: '#43b89c', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    welcome: { paddingHorizontal: 20, paddingBottom: 16 },
    greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 4 },
    welcomeName: { color: '#fff', fontSize: 26, fontWeight: '900' },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    metricCard: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        gap: 4,
    },
    metricEmoji: { fontSize: 22 },
    metricValue: { fontSize: 24, fontWeight: '900' },
    metricLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    tabs: {
        flexDirection: 'row',
        marginHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10 },
    tabActive: { backgroundColor: '#43b89c' },
    tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
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
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    activityDot: { width: 8, height: 8, borderRadius: 4 },
    activityContent: { flex: 1 },
    activityText: { color: '#fff', fontSize: 13, fontWeight: '500', marginBottom: 3 },
    activityTime: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
    activityEmoji: { fontSize: 20 },
    addUserBtn: {
        backgroundColor: '#43b89c22',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#43b89c55',
        borderStyle: 'dashed',
    },
    addUserText: { color: '#43b89c', fontSize: 15, fontWeight: '700' },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 12,
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userEmoji: { fontSize: 22 },
    userInfo: { flex: 1 },
    userName: { color: '#fff', fontSize: 15, fontWeight: '700' },
    userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '700' },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        gap: 12,
    },
    settingIcon: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
    settingEmoji: { fontSize: 22 },
    settingText: { flex: 1 },
    settingLabel: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 2 },
    settingDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
    arrow: { fontSize: 26, fontWeight: '700' },
});
