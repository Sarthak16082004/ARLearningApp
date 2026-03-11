import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen, { Role } from './src/screens/LoginScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import TeacherDashboard from './src/screens/TeacherDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import CameraScreen from './src/screens/CameraScreen';
import UploadScreen from './src/screens/UploadScreen';
import ARUploadScreen from './src/screens/ARUploadScreen';
import ARProjectsScreen from './src/screens/ARProjectsScreen';

import ARViewScreen, { ARObject } from './src/screens/student/ARViewScreen';
import AnimalListScreen from './src/screens/student/AnimalListScreen';

type Screen = 'login' | 'studentDash' | 'teacherDash' | 'adminDash' | 'camera' | 'upload' | 'arUpload' | 'arProjects' | 'arViro' | 'animalList';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState('');
  const [arCategory, setArCategory] = useState('alphabet');
  const [selectedObject, setSelectedObject] = useState<ARObject | null>(null);

  // Smooth fade transition animation
  const opacity = useRef(new Animated.Value(1)).current;

  /**
   * Navigate to a new screen with a fade-out → state change → fade-in transition.
   */
  const navigate = useCallback((updateFn: () => void) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      updateFn();
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  }, [opacity]);

  const handleLogin = (r: Role, name: string) => {
    navigate(() => {
      setRole(r);
      setUserName(name);
      if (r === 'admin') setScreen('adminDash');
      else if (r === 'teacher') setScreen('teacherDash');
      else setScreen('studentDash');
    });
  };

  const handleLogout = async () => {
    // ⚠️ CRITICAL: clear saved session so LoginScreen doesn't auto re-login
    try {
      await AsyncStorage.removeItem('ar_session');
    } catch (_e) { /* storage unavailable — proceed */ }

    navigate(() => {
      setRole(null);
      setUserName('');
      setScreen('login');
    });
  };

  const goToAR = (category: string) => {
    navigate(() => {
      setArCategory(category);
      if (category === 'animals') {
        setScreen('animalList');
      } else {
        setScreen('camera');
      }
    });
  };

  const goBackFromCamera = () => {
    navigate(() => {
      setSelectedObject(null); // Clean up
      if (role === 'admin') setScreen('adminDash');
      else if (role === 'teacher') setScreen('teacherDash');
      else setScreen('studentDash');
    });
  };

  const goToViroAR = (object: ARObject) => {
    navigate(() => {
      setSelectedObject(object);
      setScreen('arViro');
    });
  };

  const goToUpload = () => navigate(() => setScreen('upload'));
  const goToARUpload = () => navigate(() => setScreen('arUpload'));
  const goToARProjects = () => navigate(() => setScreen('arProjects'));

  const goBackFromUpload = () => {
    navigate(() => {
      if (role === 'admin') setScreen('adminDash');
      else setScreen('teacherDash');
    });
  };

  const goBackFromARUpload = () => goBackFromUpload();
  const goBackFromARProjects = () => navigate(() => setScreen('studentDash'));

  return (
    <SafeAreaProvider>
      <Animated.View style={{ flex: 1, opacity }}>

        {screen === 'login' && (
          <LoginScreen onLogin={handleLogin} />
        )}

        {screen === 'studentDash' && (
          <StudentDashboard
            onBack={handleLogout}
            onStartAR={goToAR}
            onViewProjects={goToARProjects}
            userName={userName}
          />
        )}

        {screen === 'teacherDash' && (
          <TeacherDashboard
            onBack={handleLogout}
            onUpload={goToUpload}
            onARUpload={goToARUpload}
            userName={userName}
          />
        )}

        {screen === 'adminDash' && (
          <AdminDashboard
            onBack={handleLogout}
            onUpload={goToUpload}
            userName={userName}
          />
        )}

        {screen === 'camera' && (
          <CameraScreen
            category={arCategory}
            onBack={goBackFromCamera}
          />
        )}

        {screen === 'upload' && (
          <UploadScreen onBack={goBackFromUpload} />
        )}

        {screen === 'arUpload' && (
          <ARUploadScreen onBack={goBackFromARUpload} teacherName={userName} />
        )}

        {screen === 'arProjects' && (
          <ARProjectsScreen
            onBack={goBackFromARProjects}
            onSelectProject={goToViroAR}
          />
        )}

        {screen === 'arViro' && selectedObject && (
          <ARViewScreen
            object={selectedObject}
            onBack={goBackFromCamera}
          />
        )}

        {screen === 'animalList' && (
          <AnimalListScreen
            onBack={goBackFromCamera}
            onSelectAnimal={goToViroAR}
          />
        )}

      </Animated.View>
    </SafeAreaProvider>
  );
}
