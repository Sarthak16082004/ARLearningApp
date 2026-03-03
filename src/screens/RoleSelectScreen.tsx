import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Role } from '../../App';

const { width } = Dimensions.get('window');

type Props = {
    onSelectRole: (role: Role) => void;
};

const ROLES = [
    {
        id: 'student' as Role,
        label: 'Student',
        emoji: '🎒',
        description: 'Learn with AR • Take quizzes • Track progress',
        gradient: ['#6c63ff', '#8b83ff'],
        badge: 'LEARNER',
    },
    {
        id: 'teacher' as Role,
        label: 'Teacher',
        emoji: '👩‍🏫',
        description: 'Manage lessons • Track students • Create quizzes',
        gradient: ['#ff6584', '#ff8fa3'],
        badge: 'EDUCATOR',
    },
    {
        id: 'admin' as Role,
        label: 'Admin',
        emoji: '🛡️',
        description: 'Manage users • Analytics • App settings',
        gradient: ['#43b89c', '#5dd4b8'],
        badge: 'ADMINISTRATOR',
    },
];

export default function RoleSelectScreen({ onSelectRole }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#07071a" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.appName}>AR Learning</Text>
                <Text style={styles.title}>Who are you?</Text>
                <Text style={styles.subtitle}>
                    Select your role to get a personalised experience
                </Text>
            </View>

            {/* Role Cards */}
            <View style={styles.cards}>
                {ROLES.map(role => (
                    <TouchableOpacity
                        key={role.id}
                        style={styles.card}
                        onPress={() => onSelectRole(role.id)}
                        activeOpacity={0.82}>

                        {/* Left accent bar */}
                        <View style={[styles.accentBar, { backgroundColor: role.gradient[0] }]} />

                        <View style={styles.cardInner}>
                            {/* Emoji circle */}
                            <View style={[styles.emojiCircle, { backgroundColor: role.gradient[0] + '22' }]}>
                                <Text style={styles.emoji}>{role.emoji}</Text>
                            </View>

                            {/* Text */}
                            <View style={styles.cardText}>
                                <View style={styles.row}>
                                    <Text style={styles.roleLabel}>{role.label}</Text>
                                    <View style={[styles.badge, { backgroundColor: role.gradient[0] + '33' }]}>
                                        <Text style={[styles.badgeText, { color: role.gradient[0] }]}>
                                            {role.badge}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.roleDesc}>{role.description}</Text>
                            </View>

                            {/* Arrow */}
                            <Text style={[styles.arrow, { color: role.gradient[0] }]}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>AR Learning App • v1.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07071a',
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 32,
        paddingBottom: 36,
    },
    appName: {
        color: '#6c63ff',
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 38,
        fontWeight: '900',
        marginBottom: 10,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 15,
        lineHeight: 22,
    },
    cards: {
        gap: 14,
        flex: 1,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        flexDirection: 'row',
    },
    accentBar: {
        width: 4,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    cardInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        gap: 14,
    },
    emojiCircle: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 28,
    },
    cardText: {
        flex: 1,
        gap: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roleLabel: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '800',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    roleDesc: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        lineHeight: 18,
    },
    arrow: {
        fontSize: 32,
        fontWeight: '700',
        marginRight: 4,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 24,
        paddingTop: 16,
    },
    footerText: {
        color: 'rgba(255,255,255,0.18)',
        fontSize: 12,
        letterSpacing: 0.5,
    },
});
