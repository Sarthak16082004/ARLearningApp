import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import LinearGradient from 'react-native-linear-gradient';
import { decode } from 'base64-arraybuffer';
import { useAuth } from '../../utils/AuthContext';
import { 
  getAllProfiles, 
  createProfile, 
  deleteProfile, 
  supabase, 
  getSchools, 
  getClassesInSchool, 
  createSchool, 
  createClass,
  deleteSchool,
  deleteClass,
  getARModels,
  createARModel,
  deleteARModel,
  uploadModelFile,
  resetUserPassword
} from '../../services/supabase';
import { User, ARModel, School, Class, RootStackParamList } from '../../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

type Tab = 'users' | 'schools' | 'classes' | 'models';

export default function AdminDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [roleToCreate, setRoleToCreate] = useState<'student' | 'teacher'>('student');
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, s, m] = await Promise.all([
        getAllProfiles(),
        getSchools(),
        getARModels()
      ]);
      setUsers(u || []);
      setSchools(s || []);
      setModels(m || []);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Fetch Error', 'Failed to load data from Supabase. Verify your network and RLS policies.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Admin Portal</Text>
            <Text style={styles.role}>Master Control</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          {(['users', 'schools', 'classes', 'models'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E74C3C" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#E74C3C" />
          }>
          
          {tab === 'users' && (
            <UsersTab 
              users={users} 
              schools={schools} 
              onAddStudent={() => { setRoleToCreate('student'); setShowAddUser(true); }} 
              onAddTeacher={() => { setRoleToCreate('teacher'); setShowAddUser(true); }}
              onDelete={async (u) => {
                Alert.alert("Delete User", `Are you sure you want to delete ${u.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                      await deleteProfile(u.id);
                      await fetchData();
                    } catch (e: any) {
                      Alert.alert("Error", "Failed to delete user. Check RLS policies.\n" + e.message);
                    }
                  }}
                ]);
              }}
              onResetPassword={(u) => {
                setUserToReset(u);
                setShowResetPassword(true);
              }}
            />
          )}

          {tab === 'schools' && (
            <SchoolsTab 
              schools={schools} 
              onAdd={() => setShowAddSchool(true)} 
              onDelete={async (s: School) => {
                Alert.alert("Delete School", "This will delete the school and possibly linked data. Continue?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                      await deleteSchool(s.id);
                      setSchools(prev => prev.filter(x => x.id !== s.id));
                    } catch (e: any) {
                      Alert.alert("Error", "Failed to delete school.\n" + e.message);
                    }
                  }}
                ]);
              }}
            />
          )}

          {tab === 'classes' && (
            <ClassesTab 
              schools={schools} 
              onAdd={() => setShowAddClass(true)} 
              onDelete={async (c: Class) => {
                Alert.alert("Delete Class", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => {
                    await deleteClass(c.id);
                    fetchData();
                  }}
                ]);
              }}
            />
          )}

          {tab === 'models' && (
            <ModelsTab 
              models={models} 
              onAdd={() => setShowAddModel(true)} 
              onDelete={async (m: ARModel) => {
                Alert.alert("Delete Model", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => {
                    await deleteARModel(m.id);
                    setModels(prev => prev.filter(x => x.id !== m.id));
                  }}
                ]);
              }}
            />
          )}
        </ScrollView>
      )}

      {/* Modals */}
      <AddUserModal 
        visible={showAddUser} 
        initialRole={roleToCreate}
        onClose={() => setShowAddUser(false)} 
        schools={schools}
        onSuccess={() => fetchData()} 
      />

      <AddSchoolModal 
        visible={showAddSchool} 
        onClose={() => setShowAddSchool(false)} 
        onSuccess={(s) => setSchools(prev => [...prev, s])}
      />

      <AddClassModal 
        visible={showAddClass} 
        onClose={() => setShowAddClass(false)} 
        schools={schools}
      />

      <AddModelModal
        visible={showAddModel}
        onClose={() => setShowAddModel(false)}
        onSuccess={(m: ARModel) => setModels(prev => [m, ...prev])}
      />

      <ResetPasswordModal
        visible={showResetPassword}
        user={userToReset}
        onClose={() => { setShowResetPassword(false); setUserToReset(null); }}
      />

    </LinearGradient>
  );
}

// ─── TABS ──────────────────────────────────────────────────────────────────

interface UsersTabProps {
  users: User[];
  schools: School[];
  onAddStudent: () => void;
  onAddTeacher: () => void;
  onDelete: (u: User) => void;
  onResetPassword: (u: User) => void;
}

function UsersTab({ users, schools, onAddStudent, onAddTeacher, onDelete, onResetPassword }: UsersTabProps) {
  const [expandedSchools, setExpandedSchools] = useState<string[]>([]);
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);

  const toggleSchool = (id: string) => {
    setExpandedSchools(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleClass = (id: string) => {
    setExpandedClasses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: '#3498DB' }]} onPress={onAddStudent}>
          <Text style={styles.addBtnText}>+ Add Student</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: '#9B59B6' }]} onPress={onAddTeacher}>
          <Text style={styles.addBtnText}>+ Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {schools.map(school => {
        const schoolUsers = users.filter(u => u.school_id === school.code);
        const teachers = schoolUsers.filter(u => u.role === 'teacher');
        const students = schoolUsers.filter(u => u.role === 'student');
        
        const classesInSchool = Array.from(new Set(students.map(s => s.class_name).filter(Boolean)));

        return (
          <View key={school.id} style={styles.hierarchySection}>
            <TouchableOpacity style={styles.schoolHeader} onPress={() => toggleSchool(school.id)}>
              <Text style={styles.schoolHeaderText}>🏫 {school.name} ({school.code})</Text>
              <Text style={{color: '#fff'}}>{expandedSchools.includes(school.id) ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {expandedSchools.includes(school.id) && (
              <View style={styles.hierarchyContent}>
                {teachers.length > 0 && (
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>👨‍🏫 Teachers</Text>
                    {teachers.map(t => (
                      <UserCard key={t.id} user={t} onDelete={() => onDelete(t)} onResetPassword={() => onResetPassword(t)} />
                    ))}
                  </View>
                )}

                {classesInSchool.map(className => {
                  const classStudents = students.filter(s => s.class_name === className);
                  const classId = `${school.id}-${className}`;
                  return (
                    <View key={classId} style={styles.subSection}>
                      <TouchableOpacity style={styles.classHeader} onPress={() => toggleClass(classId)}>
                        <Text style={styles.classHeaderText}>📁 Class {className} ({classStudents.length})</Text>
                        <Text style={{color: '#aaa'}}>{expandedClasses.includes(classId) ? '▼' : '▶'}</Text>
                      </TouchableOpacity>
                      
                      {expandedClasses.includes(classId) && (
                        <View style={{paddingLeft: 10}}>
                          {classStudents.map(s => (
                            <UserCard key={s.id} user={s} onDelete={() => onDelete(s)} onResetPassword={() => onResetPassword(s)} />
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

    </View>
  );
}

function UserCard({ user, onDelete, onResetPassword }: { user: User, onDelete: () => void, onResetPassword: () => void }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{user.name}</Text>
        <Text style={styles.cardSub}>
          {user.username} • {user.role.toUpperCase()}
          {user.roll_number ? ` • Roll: ${user.roll_number}` : ''}
          {user.dob ? ` • DOB: ${user.dob}` : ''}
        </Text>
        {user.parent_mobile && <Text style={styles.detailText}>📞 Parent: {user.parent_mobile}</Text>}
        {user.personal_detail_1 && <Text style={styles.adminOnlyText}>🔒 Detail 1: {user.personal_detail_1}</Text>}
        {user.personal_detail_2 && <Text style={styles.adminOnlyText}>🔒 Detail 2: {user.personal_detail_2}</Text>}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity style={styles.resetBtn} onPress={onResetPassword}>
          <Text style={{ fontSize: 16 }}>🔑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SchoolsTabProps {
  schools: School[];
  onAdd: () => void;
  onDelete: (s: School) => void;
}

function SchoolsTab({ schools, onAdd, onDelete }: SchoolsTabProps) {
  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>+ Register New School</Text>
      </TouchableOpacity>
      {schools.map((s: School) => (
        <View key={s.id} style={styles.card}>
          <View style={{flex: 1}}>
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardSub}>Code: {s.code}</Text>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(s)}>
            <Text style={{fontSize: 16}}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

interface ClassesTabProps {
  schools: School[];
  onAdd: () => void;
  onDelete: (c: Class) => void;
}

function ClassesTab({ schools, onAdd, onDelete }: ClassesTabProps) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);

  const loadClasses = async () => {
    if (selectedSchool) {
      const data = await getClassesInSchool(selectedSchool.id);
      setClasses(data || []);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [selectedSchool]);

  return (
    <View>
      <Text style={styles.label}>Pick a School to view Classes</Text>
      <ScrollView horizontal style={{marginBottom: 15}}>
        {schools.map((s: School) => (
          <TouchableOpacity 
            key={s.id} 
            style={[styles.schoolTag, selectedSchool?.id === s.id && styles.schoolTagActive]}
            onPress={() => setSelectedSchool(s)}>
            <Text style={{color: '#fff'}}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedSchool && (
        <>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Text style={styles.addBtnText}>+ Add Class to {selectedSchool.name}</Text>
          </TouchableOpacity>
          {classes.map((c: Class) => (
            <View key={c.id} style={styles.card}>
              <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{c.class_name}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => {
                onDelete(c);
              }}>
                <Text style={{fontSize: 16}}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

interface ModelsTabProps {
  models: ARModel[];
  onAdd: () => void;
  onDelete: (m: ARModel) => void;
}

function ModelsTab({ models, onAdd, onDelete }: ModelsTabProps) {
  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
        <Text style={styles.addBtnText}>+ Add New AR Model</Text>
      </TouchableOpacity>
      {models.map((m: ARModel) => (
        <View key={m.id} style={styles.card}>
          <View style={{flex: 1}}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <Text style={styles.cardSub}>{m.category} • {m.subcategory || 'General'}</Text>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(m)}>
            <Text style={{fontSize: 16}}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// ─── MODALS ────────────────────────────────────────────────────────────────

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  schools: School[];
  onSuccess: (u: User) => void;
  initialRole: 'student' | 'teacher';
}

function AddUserModal({ visible, onClose, schools, onSuccess, initialRole }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // New Fields
  const [rollNumber, setRollNumber] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [personal1, setPersonal1] = useState('');
  const [personal2, setPersonal2] = useState('');
  const [dob, setDob] = useState('');

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);

  // Auto-generate username: name_dob
  useEffect(() => {
    if (name) {
      const cleanName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanDob = dob.replace(/[^0-9]/g, '');
      if (cleanDob) {
        setUsername(`${cleanName}${cleanDob}`);
      } else {
        setUsername(cleanName);
      }
    }
  }, [name, dob]);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole, visible]);

  useEffect(() => {
    if (selectedSchool) {
      getClassesInSchool(selectedSchool.id).then(setClasses);
    }
  }, [selectedSchool]);

  const handleCreate = async () => {
    if (!name || !selectedSchool || !username || !password) {
      Alert.alert('Error', 'Missing basic fields (Name, School, Auth)');
      return;
    }
    setLoading(true);
    try {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9.]/g, '');
      const cleanClass = role === 'student' 
        ? (selectedClass?.class_name || 'gen').toLowerCase().replace(/[^a-z0-9]/g, '')
        : 'staff';
      const cleanSchool = selectedSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '');

      const finalEmail = `${cleanUsername}.${cleanClass}.${cleanSchool}@arlearn.com`;
      console.log('Attempting signup with cleaned email:', finalEmail);

      const cleanPassword = password.trim();
      const { data, error } = await supabase.auth.signUp({ email: finalEmail, password: cleanPassword });
      if (error) throw error;

      const profile = await createProfile({
        id: data.user!.id,
        email: finalEmail,
        name,
        role,
        school_id: selectedSchool.code,
        class_name: selectedClass?.class_name,
        username,
        roll_number: role === 'student' ? rollNumber : undefined,
        parent_mobile: role === 'student' ? parentMobile : undefined,
        personal_detail_1: personal1,
        personal_detail_2: personal2,
        dob,
        must_change_password: false,
      });

      onSuccess(profile);
      onClose();
      // Reset fields
      setName(''); setUsername(''); setPassword('');
      setRollNumber(''); setParentMobile(''); setPersonal1(''); setPersonal2(''); setDob('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>New {role === 'student' ? 'Student' : 'Teacher'}</Text>
          <ScrollView>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.choice, role === 'student' && styles.choiceActive]} onPress={() => setRole('student')}>
                <Text style={{color: '#fff'}}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.choice, role === 'teacher' && styles.choiceActive]} onPress={() => setRole('teacher')}>
                <Text style={{color: '#fff'}}>Teacher</Text>
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
            
            <TextInput style={styles.input} placeholder="Date of Birth (e.g. 20042001)" placeholderTextColor="#aaa" value={dob} onChangeText={setDob} keyboardType="numeric" />

            <Text style={styles.label}>School</Text>
            <ScrollView horizontal style={{marginBottom: 10}}>
              {schools.map((s: School) => (
                <TouchableOpacity key={s.id} style={[styles.tag, selectedSchool?.id === s.id && styles.tagActive]} onPress={() => setSelectedSchool(s)}>
                  <Text style={{color: '#fff'}}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {role === 'student' && selectedSchool && (
              <>
                <Text style={styles.label}>Class</Text>
                <ScrollView horizontal style={{marginBottom: 10}}>
                  {classes.map((c: Class) => (
                    <TouchableOpacity key={c.id} style={[styles.tag, selectedClass?.id === c.id && styles.tagActive]} onPress={() => setSelectedClass(c)}>
                      <Text style={{color: '#fff'}}>{c.class_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TextInput style={styles.input} placeholder="Roll Number" placeholderTextColor="#aaa" value={rollNumber} onChangeText={setRollNumber} />
                <TextInput style={styles.input} placeholder="Parent Mobile Number" placeholderTextColor="#aaa" value={parentMobile} onChangeText={setParentMobile} keyboardType="phone-pad" />
              </>
            )}

            <View style={styles.divider} />
            <Text style={styles.label}>Admin Only Details</Text>
            <TextInput style={styles.input} placeholder="Unique Personal Detail 1" placeholderTextColor="#aaa" value={personal1} onChangeText={setPersonal1} />
            <TextInput style={styles.input} placeholder="Unique Personal Detail 2" placeholderTextColor="#aaa" value={personal2} onChangeText={setPersonal2} />

            <View style={styles.divider} />
            <Text style={styles.label}>Authentication</Text>
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Set Password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.finalBtn} onPress={handleCreate}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finalBtnText}>Create User</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{marginTop: 15}}><Text style={{color: '#E74C3C', textAlign: 'center'}}>Cancel</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface AddSchoolModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (s: School) => void;
}

function AddSchoolModal({ visible, onClose, onSuccess }: AddSchoolModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!name || !code) return;
    setLoading(true);
    try {
      const s = await createSchool({ name, code });
      onSuccess(s);
      onClose();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Register School</Text>
          <TextInput style={styles.input} placeholder="School Name (e.g. Global High)" placeholderTextColor="#aaa" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Unique Code (e.g. GH01)" placeholderTextColor="#aaa" value={code} onChangeText={setCode} autoCapitalize="characters" />
          <TouchableOpacity style={styles.finalBtn} onPress={handle}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finalBtnText}>Register</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{marginTop: 15}}><Text style={{color: '#E74C3C', textAlign: 'center'}}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface AddClassModalProps {
  visible: boolean;
  onClose: () => void;
  schools: School[];
}

function AddClassModal({ visible, onClose, schools }: AddClassModalProps) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!selectedSchool || !name) return;
    setLoading(true);
    try {
      await createClass({ school_id: selectedSchool.id, class_name: name });
      onClose();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Class</Text>
          <Text style={styles.label}>Target School</Text>
          <ScrollView horizontal style={{marginBottom: 10}}>
            {schools.map((s: School) => (
              <TouchableOpacity key={s.id} style={[styles.tag, selectedSchool?.id === s.id && styles.tagActive]} onPress={() => setSelectedSchool(s)}>
                <Text style={{color: '#fff'}}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} placeholder="Class Name (e.g. 10A)" placeholderTextColor="#aaa" value={name} onChangeText={setName} autoCapitalize="characters" />
          <TouchableOpacity style={styles.finalBtn} onPress={handle}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finalBtnText}>Create Class</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{marginTop: 15}}><Text style={{color: '#E74C3C', textAlign: 'center'}}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

interface AddModelModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (m: ARModel) => void;
}

function AddModelModal({ visible, onClose, onSuccess }: AddModelModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Physics');
  const [modelUrl, setModelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categories = ['Physics', 'Chemistry', 'Biology', 'Maths', 'History', 'Geography'];

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // .glb, .gltf
      });
      
      const file = res[0];
      setUploading(true);
      
      const filePath = `models/${Date.now()}_${file.name}`;
      const base64 = await ReactNativeBlobUtil.fs.readFile(file.uri, 'base64');
      const arrayBuffer = decode(base64);
      
      const url = await uploadModelFile(filePath, arrayBuffer, file.type || 'application/octet-stream');
      setModelUrl(url);
      Alert.alert('Success', 'Model uploaded successfully!');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      Alert.alert('Error', 'Failed to upload: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !description || !modelUrl) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const realModel = await createARModel({
        title,
        description,
        category,
        model_url: modelUrl,
        teacher_id: user!.id,
      });

      onSuccess(realModel);
      onClose();
      setTitle(''); setDescription(''); setModelUrl('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add AR Model</Text>
          <ScrollView>
            <TextInput 
              style={styles.input} 
              placeholder="Model Title" 
              placeholderTextColor="#aaa" 
              value={title} 
              onChangeText={setTitle} 
            />
            <TextInput 
              style={[styles.input, {height: 80}]} 
              placeholder="Description" 
              placeholderTextColor="#aaa" 
              value={description} 
              onChangeText={setDescription} 
              multiline
            />
            
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal style={{marginBottom: 10}}>
              {categories.map(c => (
                <TouchableOpacity 
                  key={c} 
                  style={[styles.tag, category === c && styles.tagActive]} 
                  onPress={() => setCategory(c)}
                >
                  <Text style={{color: '#fff'}}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{marginBottom: 15}}>
              <TouchableOpacity 
                style={[styles.addBtn, {backgroundColor: '#3498DB', marginBottom: 10}]} 
                onPress={pickFile}
                disabled={uploading}
              >
                {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>📁 Upload Model File (.glb)</Text>}
              </TouchableOpacity>
              
              <TextInput 
                style={[styles.input, {fontSize: 10}]} 
                placeholder="...or enter Model URL manually" 
                placeholderTextColor="#666" 
                value={modelUrl} 
                onChangeText={setModelUrl} 
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.finalBtn} onPress={handleCreate}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finalBtnText}>Confirm & Add Model</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{marginTop: 15}}>
              <Text style={{color: '#E74C3C', textAlign: 'center'}}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface ResetPasswordModalProps {
  visible: boolean;
  user: User | null;
  onClose: () => void;
}

function ResetPasswordModal({ visible, user, onClose }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const cleanNewPassword = newPassword.trim();
      await resetUserPassword(user.id, cleanNewPassword);
      Alert.alert('Success', `Password updated for ${user.name}`);
      setNewPassword('');
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>🔑 Reset Password</Text>
          {user && (
            <Text style={{color: '#fff', marginBottom: 20}}>
              Setting new password for: <Text style={{fontWeight: 'bold', color: '#3498DB'}}>{user.name}</Text>
            </Text>
          )}
          <TextInput 
            style={styles.input} 
            placeholder="New Password (min 6 chars)" 
            placeholderTextColor="#aaa" 
            value={newPassword} 
            onChangeText={setNewPassword} 
            secureTextEntry 
          />
          <TouchableOpacity style={[styles.finalBtn, {backgroundColor: '#3498DB'}]} onPress={handleReset}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.finalBtnText}>Reset Password</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{marginTop: 15}}>
            <Text style={{color: '#E74C3C', textAlign: 'center'}}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#fff' },
  role: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoutText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: '#E74C3C' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  addBtn: { backgroundColor: '#E74C3C', padding: 15, borderRadius: 14, alignItems: 'center', marginBottom: 20 },
  addBtnText: { color: '#fff', fontWeight: '800' },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  label: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 10, marginTop: 5 },
  schoolTag: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginRight: 8 },
  schoolTagActive: { backgroundColor: '#3498DB' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1A1535', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '85%' },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, color: '#fff', marginBottom: 15 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  choice: { flex: 1, padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, alignItems: 'center' },
  choiceActive: { backgroundColor: '#E74C3C' },
  tag: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginRight: 8 },
  tagActive: { backgroundColor: '#3498DB' },
  finalBtn: { backgroundColor: '#27AE60', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  finalBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  hierarchySection: { marginBottom: 15 },
  schoolHeader: { backgroundColor: 'rgba(231, 76, 60, 0.2)', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#E74C3C' },
  schoolHeaderText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  hierarchyContent: { paddingLeft: 10, marginTop: 10 },
  subSection: { marginBottom: 10 },
  subSectionTitle: { color: '#aaa', fontSize: 12, fontWeight: '700', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 1 },
  classHeader: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  classHeaderText: { color: '#ddd', fontSize: 14, fontWeight: '600' },
  emptyText: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 10, fontSize: 12 },
  detailText: { color: '#3498DB', fontSize: 11, marginTop: 2, fontWeight: '600' },
  adminOnlyText: { color: '#F1C40F', fontSize: 11, marginTop: 2, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 15 },
  deleteBtn: { backgroundColor: 'rgba(231, 76, 60, 0.15)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(231, 76, 60, 0.3)' },
  resetBtn: { backgroundColor: 'rgba(52, 152, 219, 0.15)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(52, 152, 219, 0.3)' },
});
