import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { signIn, getUserProfile, getSchools, getClassesInSchool } from '../../services/supabase';
import { useAuth } from '../../utils/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type UserRole = 'student' | 'teacher' | 'admin';

const ROLES: { id: UserRole; label: string; icon: string; color: string }[] = [
  { id: 'student', label: 'Student', icon: '🎓', color: '#3498DB' },
  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫', color: '#27AE60' },
  { id: 'admin', label: 'Admin', icon: '⚙️', color: '#E74C3C' },
];

export default function LoginScreen({ navigation }: Props) {
  const { setUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Multi-Key Logic for Dropdowns
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [username, setUsername] = useState('');

  // Dropdown UI States
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  // General Creds
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const scaleAnims = useRef(ROLES.map(() => new Animated.Value(1))).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.id);
    }
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      const data = await getSchools();
      if (!data || data.length === 0) {
        console.warn('No schools returned from Supabase. Check RLS policies.');
      }
      setSchools(data || []);
    } catch (e: any) {
      console.error('Error fetching schools:', e);
      Alert.alert(
        'Connection Error', 
        'Could not load schools. Please check your internet connection.',
        [{ text: 'Retry', onPress: fetchSchools }]
      );
    }
  };

  const fetchClasses = async (sid: string) => {
    try {
      const data = await getClassesInSchool(sid);
      setClasses(data || []);
      setSelectedClass(null); // Reset class if school changes
    } catch (e) {
      console.error('Error fetching classes:', e);
    }
  };

  const selectRole = (index: number, role: UserRole) => {
    setSelectedRole(role);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    // 1. Permanent Admin Bypass
    if (selectedRole === 'admin' && email === 'Sarthak2004' && password === 'Sarthak@2004') {
      setUser({
        id: 'admin-bypass',
        email: 'admin@arlearn.com',
        name: 'Sarthak',
        role: 'admin',
        school_id: 'SYSTEM',
        created_at: new Date().toISOString(),
        must_change_password: false,
      });
      return;
    }

    let finalEmail = email.trim();

    // 2. Student/Teacher Triple-Key Logic
    if (selectedRole !== 'admin') {
      if (!selectedSchool || !username || !password) {
        shake();
        Alert.alert('Missing Fields', 'Please select your school and enter credentials.');
        return;
      }
      if (selectedRole === 'student' && !selectedClass) {
        shake();
        Alert.alert('Missing Class', 'Students must select their class.');
        return;
      }
      
      const cleanUser = username.toLowerCase().replace(/[^a-z0-9.]/g, '');
      const cleanSchool = selectedSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (selectedRole === 'student') {
        const cleanClass = selectedClass.class_name.toLowerCase().replace(/[^a-z0-9]/g, '');
        finalEmail = `${cleanUser}.${cleanClass}.${cleanSchool}@arlearn.com`;
      } else {
        finalEmail = `${cleanUser}.staff.${cleanSchool}@arlearn.com`;
      }
    }

    setLoading(true);
    try {
      // Trim password to prevent mobile keyboards from ruining login with trailing spaces
      const cleanPassword = password.trim();
      const data = await signIn(finalEmail, cleanPassword);
      const profile = await getUserProfile(data.user.id);
 
      if (!profile) {
        await signOut();
        setLoading(false);
        Alert.alert('Access Denied', 'Your account has not been authorized by the Admin.');
        return;
      }
 
      if (profile.role !== selectedRole) {
        Alert.alert('Wrong Role', `This account is registered as a ${profile.role}. Please select the correct role above.`);
        setLoading(false);
        return;
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: profile.name || 'User',
        role: profile.role,
        school_id: profile.school_id,
        class_name: profile.class_name,
        must_change_password: profile.must_change_password,
        created_at: profile.created_at || '',
      });
    } catch (err: any) {
      shake();
      const errMsg = err.message || '';
      if (errMsg.includes('Invalid login credentials')) {
        Alert.alert('Login Failed', 'Incorrect username, password, or class. Please double-check your spelling.');
      } else {
        Alert.alert('Login Failed', errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find(r => r.id === selectedRole)!;

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={styles.logoEmoji}>🔮</Text>
            <Text style={styles.title}>AR Learn</Text>
            <Text style={styles.subtitle}>Unified Learning Portal</Text>
          </View>

          <View style={styles.roleRow}>
            {ROLES.map((role, i) => {
              const isActive = selectedRole === role.id;
              return (
                <TouchableOpacity key={role.id} style={[styles.roleCard, isActive && { borderColor: role.color, backgroundColor: role.color + '22' }]} onPress={() => selectRole(i, role.id)}>
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Text style={[styles.roleLabel, isActive && { color: role.color }]}>{role.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.cardTitle}>{activeRole.icon} {activeRole.label} Entrance</Text>

            {selectedRole !== 'admin' && (
              <>
                <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowSchoolModal(true)}>
                  <Text style={styles.inputLabel}>Select School</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>🏫</Text>
                    <Text style={[styles.input, !selectedSchool && { color: 'rgba(255,255,255,0.3)' }]} numberOfLines={1}>
                      {selectedSchool ? selectedSchool.name : 'Choose your school'}
                    </Text>
                    <Text style={[styles.inputIcon, {marginRight: 0}]}>⌄</Text>
                  </View>
                </TouchableOpacity>

                {selectedRole === 'student' && (
                  <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowClassModal(true)} disabled={!selectedSchool}>
                    <Text style={styles.inputLabel}>Select Class</Text>
                    <View style={[styles.inputContainer, !selectedSchool && { opacity: 0.5 }]}>
                      <Text style={styles.inputIcon}>📝</Text>
                      <Text style={[styles.input, !selectedClass && { color: 'rgba(255,255,255,0.3)' }]}>
                        {selectedClass ? selectedClass.class_name : 'Choose your class'}
                      </Text>
                      <Text style={[styles.inputIcon, {marginRight: 0}]}>⌄</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput style={styles.input} placeholder="Your unique name" placeholderTextColor="rgba(255,255,255,0.3)" value={username} onChangeText={setUsername} autoCapitalize="none" />
                  </View>
                </View>
              </>
            )}

            {selectedRole === 'admin' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Admin Username / Email</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="rgba(255,255,255,0.3)" value={email} onChangeText={setEmail} autoCapitalize="none" />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Secure Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="rgba(255,255,255,0.3)" value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={[styles.inputIcon, {marginRight: 0}]}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
              <LinearGradient colors={[activeRole.color, activeRole.color + 'CC']} style={styles.loginGradient}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Authenticate</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* School Selector Modal */}
          <Modal visible={showSchoolModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🏫 Select Your School</Text>
                <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                  {schools.length === 0 ? (
                    <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>No schools found</Text>
                  ) : (
                    schools.map(s => (
                      <TouchableOpacity key={s.id} style={styles.option} onPress={() => { setSelectedSchool(s); setShowSchoolModal(false); }}>
                        <Text style={styles.optionText}>{s.name}</Text>
                        <Text style={styles.optionSub}>{s.code}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowSchoolModal(false)} style={styles.closeBtnWrapper}>
                  <Text style={styles.closeBtn}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Class Selector Modal */}
          <Modal visible={showClassModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>📝 Select Your Class</Text>
                <ScrollView contentContainerStyle={{paddingBottom: 20}}>
                  {classes.length === 0 ? (
                    <Text style={{color: '#fff', textAlign: 'center', marginTop: 20}}>No classes found for this school</Text>
                  ) : (
                    classes.map(c => (
                      <TouchableOpacity key={c.id} style={styles.option} onPress={() => { setSelectedClass(c); setShowClassModal(false); }}>
                        <Text style={styles.optionText}>{c.class_name}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowClassModal(false)} style={styles.closeBtnWrapper}>
                  <Text style={styles.closeBtn}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 25 },
  logoEmoji: { fontSize: 40, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  roleCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', paddingVertical: 12 },
  roleIcon: { fontSize: 24, marginBottom: 4 },
  roleLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { marginBottom: 12 },
  inputLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12 },
  inputIcon: { fontSize: 16, marginRight: 8, color: 'rgba(255,255,255,0.5)' },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 12 },
  loginButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  loginGradient: { paddingVertical: 14, alignItems: 'center' },
  loginText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1A1535', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '60%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20 },
  option: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  optionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  optionSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  closeBtnWrapper: { marginTop: 20, paddingVertical: 10 },
  closeBtn: { color: '#E74C3C', textAlign: 'center', fontSize: 16, fontWeight: '700' }
});
