import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {supabase, updateProfile} from '../../services/supabase';
import {useAuth} from '../../utils/AuthContext';

export default function ChangePasswordScreen() {
  const {user, refreshUser} = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew || cleanNew.length < 6) {
      Alert.alert('Password Too Short', 'Your new password must be at least 6 characters long.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      Alert.alert('Mismatch', 'Passwords do not match. Please type carefully.');
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error('Session lost. Please log in again.');

      // 1. Update Supabase Auth Password
      const {error: authError} = await supabase.auth.updateUser({
        password: cleanNew,
      });
      if (authError) throw authError;

      // 2. Update Profile flag in DB
      const {error: profileError} = await supabase
        .from('profiles')
        .update({must_change_password: false})
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      // 3. Force a refresh of the user data from Supabase
      // This ensures AuthContext gets the latest 'must_change_password = false'
      await refreshUser();
      
      Alert.alert(
        'Success', 
        'Password updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      console.error('Password Change Error:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
      setLoading(false); // Only stop loading on error so the screen doesn't flicker on success
    }
    // Note: We don't setLoading(false) in finally because 
    // if successful, the entire screen will be unmounted by the navigator.
  };

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        
        <View style={styles.header}>
          <Text style={styles.title}>🔒 Secure Your Account</Text>
          <Text style={styles.subtitle}>You must change your initial password before continuing.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
            disabled={loading}>
            <LinearGradient
              colors={['#9B59B6', '#8E44AD']}
              style={styles.gradient}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {flex: 1, justifyContent: 'center', padding: 20},
  header: {alignItems: 'center', marginBottom: 30},
  title: {fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 10},
  subtitle: {fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 20},
  card: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputWrapper: {marginBottom: 20},
  label: {color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600', marginBottom: 8},
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 15,
  },
  input: {color: '#fff', paddingVertical: 14, fontSize: 16},
  button: {marginTop: 10, borderRadius: 14, overflow: 'hidden'},
  gradient: {paddingVertical: 16, alignItems: 'center'},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: '700'},
});
