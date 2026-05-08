import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useAuth} from '../../utils/AuthContext';
import {getARModels, deleteARModel, getAllProfiles} from '../../services/supabase';
import {ARModel, RootStackParamList} from '../../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherHome'>;

export default function TeacherHomeScreen({navigation}: Props) {
  const {user, logout} = useAuth();
  const [models, setModels] = useState<ARModel[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tab, setTab] = useState<'models' | 'students'>('models');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allModels, allProfiles] = await Promise.all([
        getARModels(),
        getAllProfiles()
      ]);

      // Filter models by teacher
      const mine = (allModels || []).filter((m: ARModel) => m.teacher_id === user?.id);
      setModels(mine);

      // Filter students by school
      const schoolStudents = (allProfiles || []).filter(
        (p: any) => p.role === 'student' && p.school_id === user?.school_id
      );
      setStudents(schoolStudents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (model: ARModel) => {
    Alert.alert(
      'Delete Model',
      `Are you sure you want to delete "${model.title}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteARModel(model.id);
              setModels(prev => prev.filter(m => m.id !== model.id));
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  };

  const stats = {
    total: models.length,
    alphabets: models.filter(m => m.category === 'alphabets').length,
    numbers: models.filter(m => m.category === 'numbers').length,
    animals: models.filter(m => m.category === 'animals').length,
    shapes: models.filter(m => m.category === 'shapes').length,
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{flex: 1}}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient
        colors={['#27AE60', '#1E8449']}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👨‍🏫</Text>
            <Text style={styles.role}>Teacher Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            {label: 'Total', value: stats.total, icon: '📦'},
            {label: 'A-Z', value: stats.alphabets, icon: '🔤'},
            {label: '0-9', value: stats.numbers, icon: '🔢'},
            {label: 'Animals', value: stats.animals, icon: '🐾'},
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, tab === 'models' && styles.tabActive]} 
            onPress={() => setTab('models')}>
            <Text style={[styles.tabText, tab === 'models' && styles.tabTextActive]}>MY MODELS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, tab === 'students' && styles.tabActive]} 
            onPress={() => setTab('students')}>
            <Text style={[styles.tabText, tab === 'students' && styles.tabTextActive]}>STUDENTS</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Upload FAB - only for models tab */}
      {tab === 'models' && (
        <TouchableOpacity
          style={styles.uploadFab}
          onPress={() => navigation.navigate('UploadModel')}
          activeOpacity={0.85}>
          <LinearGradient
            colors={['#27AE60', '#1A8040']}
            style={styles.uploadFabGradient}>
            <Text style={styles.uploadFabIcon}>+</Text>
            <Text style={styles.uploadFabText}>Upload AR Model</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : (
        <FlatList
          data={tab === 'models' ? models : students}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
              tintColor="#27AE60"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>{tab === 'models' ? '📤' : '👥'}</Text>
              <Text style={styles.emptyTitle}>
                {tab === 'models' ? 'No AR Models Yet' : 'No Students Found'}
              </Text>
              <Text style={styles.emptyText}>
                {tab === 'models' 
                  ? 'Upload your first .glb model to get started!' 
                  : 'Contact Admin to add students to your school.'}
              </Text>
            </View>
          }
          renderItem={({item}) => (
            tab === 'models' ? (
              <ModelListItem
                model={item}
                onDelete={() => handleDelete(item)}
              />
            ) : (
              <StudentListItem student={item} />
            )
          )}
        />
      )}
    </LinearGradient>
  );
}

function ModelListItem({model, onDelete}: {model: ARModel; onDelete: () => void}) {
  const CAT_COLORS: Record<string, string> = {
    alphabets: '#4158D0',
    numbers: '#0093E9',
    shapes: '#8EC5FC',
    animals: '#F093FB',
  };
  const color = CAT_COLORS[model.category] || '#9B59B6';

  return (
    <View style={styles.modelItem}>
      <View style={[styles.modelCategoryTag, {backgroundColor: color + '30'}]}>
        <Text style={[styles.modelCategoryText, {color}]}>
          {model.category.toUpperCase()}
        </Text>
      </View>
      <View style={styles.modelItemContent}>
        <Text style={styles.modelTitle}>{model.title}</Text>
        <Text style={styles.modelDesc} numberOfLines={1}>
          {model.description}
        </Text>
        <Text style={styles.modelDate}>
          📅 {new Date(model.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        activeOpacity={0.7}>
        <Text style={styles.deleteBtnIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

function StudentListItem({student}: {student: any}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentClass}>
          Class {student.class_name || 'N/A'} • Roll: {student.roll_number || '--'}
        </Text>
        {student.dob && <Text style={styles.studentDob}>📅 DOB: {student.dob}</Text>}
        <View style={styles.parentRow}>
          <Text style={styles.parentLabel}>📞 Parent:</Text>
          <Text style={styles.parentValue}>{student.parent_mobile || 'Not set'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {paddingTop: 54, paddingBottom: 20, paddingHorizontal: 20},
  headerContent: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16},
  greeting: {fontSize: 22, fontWeight: '800', color: '#fff'},
  role: {fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2},
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: {flexDirection: 'row', gap: 10},
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statIcon: {fontSize: 18},
  statNumber: {fontSize: 20, fontWeight: '800', color: '#fff'},
  statLabel: {fontSize: 10, color: 'rgba(255,255,255,0.7)'},
  tabBar: { flexDirection: 'row', gap: 15, marginTop: 20 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#27AE60' },
  uploadFab: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#27AE60',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  uploadFabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  uploadFabIcon: {fontSize: 22, color: '#fff', fontWeight: '700'},
  uploadFabText: {fontSize: 15, color: '#fff', fontWeight: '700'},
  centered: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {paddingHorizontal: 16, paddingBottom: 30, gap: 12},
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyEmoji: {fontSize: 50},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: '#fff'},
  emptyText: {fontSize: 13, color: 'rgba(255,255,255,0.55)', textAlign: 'center'},
  modelItem: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modelCategoryTag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modelCategoryText: {fontSize: 9, fontWeight: '800', letterSpacing: 0.5},
  modelItemContent: {flex: 1},
  modelTitle: {fontSize: 14, fontWeight: '700', color: '#fff'},
  modelDesc: {fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2},
  modelDate: {fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4},
  deleteBtn: {
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.2)',
  },
  deleteBtnIcon: {fontSize: 16},
  studentCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  studentClass: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  studentDob: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  parentRow: { flexDirection: 'row', gap: 5, marginTop: 8, alignItems: 'center' },
  parentLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  parentValue: { fontSize: 12, color: '#3498DB', fontWeight: '700' },
});
