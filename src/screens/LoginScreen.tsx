import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    StatusBar, Animated, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Role = 'student' | 'teacher' | 'admin';

type Props = {
    onLogin: (role: Role, name: string) => void;
};

const CREDENTIALS: { username: string; password: string; role: Role; name: string; emoji: string; color: string }[] = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin', emoji: '🛡️', color: '#43b89c' },
    { username: 'teacher', password: 'teacher123', role: 'teacher', name: 'Ms. Priya Sharma', emoji: '👩‍🏫', color: '#ff6584' },
    { username: 'student', password: 'student123', role: 'student', name: 'Aarav Singh', emoji: '🎒', color: '#6c63ff' },
];

export default function LoginScreen({ onLogin }: Props) {
    const insets = useSafeAreaInsets();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const glowAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in animation
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
                ])
            ),
        ]).start();

        // Try to auto-restore previous session
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('ar_session');
                if (raw) {
                    const s = JSON.parse(raw);
                    if (s && s.role && s.name) {
                        onLogin(s.role as Role, s.name as string);
                    }
                }
            } catch (_e) {
                // No saved session — that's fine
            }
        })();
    }, []);

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Please enter username and password.');
            return;
        }
        setLoading(true);
        try {
            // Small delay for visual feedback (reduced to 400ms)
            await new Promise(r => setTimeout(r, 400));

            const u = username.trim().toLowerCase();
            const p = password.trim();
            const match = CREDENTIALS.find(
                c => c.username.toLowerCase() === u && c.password === p
            );

            if (match) {
                // Save session (ignore errors — login still works)
                try {
                    await AsyncStorage.setItem('ar_session',
                        JSON.stringify({ role: match.role, name: match.name })
                    );
                } catch (_e) { /* storage unavailable — proceed anyway */ }

                onLogin(match.role, match.name);
            } else {
                setError('Wrong credentials. Tap a demo card below to fill automatically.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fillCred = (c: typeof CREDENTIALS[0]) => {
        setUsername(c.username);
        setPassword(c.password);
        setError('');
    };

    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

    return (
        <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#060614" />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Logo */}
                <View style={styles.logoArea}>
                    <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoEmoji}>🔮</Text>
                    </View>
                    <Text style={styles.appName}>AR Learning</Text>
                    <Text style={styles.tagline}>Augmented Reality Education Platform</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome back</Text>
                    <Text style={styles.cardSub}>Sign in to your account</Text>

                    {/* Username */}
                    <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Username</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter username"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldWrap}>
                        <Text style={styles.fieldLabel}>Password</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Enter password"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.loginBtnText}>Sign In →</Text>
                        }
                    </TouchableOpacity>

                    <Text style={styles.forgotText}>Forgot password? Contact your administrator</Text>
                </View>

                {/* Demo credentials */}
                <View style={styles.demoSection}>
                    <Text style={styles.demoTitle}>Demo Credentials — tap to fill</Text>
                    <View style={styles.demoCards}>
                        {CREDENTIALS.map(c => (
                            <TouchableOpacity
                                key={c.role}
                                style={[styles.demoCard, { borderColor: c.color + '66' }]}
                                onPress={() => fillCred(c)}
                                activeOpacity={0.8}>
                                <Text style={styles.demoEmoji}>{c.emoji}</Text>
                                <Text style={[styles.demoRole, { color: c.color }]}>{c.role.toUpperCase()}</Text>
                                <Text style={styles.demoUser}>{c.username}</Text>
                                <Text style={styles.demoPass}>{c.password}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, backgroundColor: '#060614', paddingBottom: 40 },
    content: { paddingHorizontal: 20 },
    logoArea: { alignItems: 'center', marginBottom: 32, position: 'relative' },
    glow: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        backgroundColor: '#6c63ff', top: -10,
    },
    logoCircle: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(108,99,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'rgba(108,99,255,0.5)', marginBottom: 14,
    },
    logoEmoji: { fontSize: 44 },
    appName: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 6 },
    tagline: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' },
    card: {
        backgroundColor: 'rgba(255,255,255,0.055)', borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24,
    },
    cardTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    cardSub: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 22 },
    fieldWrap: { marginBottom: 16 },
    fieldLabel: {
        color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700',
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 14, paddingVertical: 4,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { color: '#fff', fontSize: 15, flex: 1, height: 46 },
    eyeBtn: { padding: 8 },
    eyeIcon: { fontSize: 18 },
    errorText: { color: '#ff6584', fontSize: 13, marginBottom: 12, textAlign: 'center' },
    loginBtn: {
        backgroundColor: '#6c63ff', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', marginBottom: 14, marginTop: 4,
        shadowColor: '#6c63ff', shadowRadius: 16, shadowOpacity: 0.5, elevation: 6,
    },
    loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
    forgotText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' },
    demoSection: {},
    demoTitle: {
        color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700',
        textAlign: 'center', marginBottom: 12, letterSpacing: 0.5
    },
    demoCards: { flexDirection: 'row', gap: 10 },
    demoCard: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
        padding: 12, alignItems: 'center', borderWidth: 1.5, gap: 4,
    },
    demoEmoji: { fontSize: 22 },
    demoRole: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    demoUser: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },
    demoPass: { color: 'rgba(255,255,255,0.35)', fontSize: 10 },
});
