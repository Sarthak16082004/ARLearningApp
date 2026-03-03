import * as React from 'react';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen, { Role } from './src/screens/LoginScreen';
import StudentDashboard from './src/screens/StudentDashboard';
import TeacherDashboard from './src/screens/TeacherDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import CameraScreen from './src/screens/CameraScreen';
import UploadScreen from './src/screens/UploadScreen';

type Screen = 'login' | 'studentDash' | 'teacherDash' | 'adminDash' | 'camera' | 'upload';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState<Role | null>(null);
  const [userName, setUserName] = useState('');
  const [arCategory, setArCategory] = useState('alphabet');

  const handleLogin = (r: Role, name: string) => {
    setRole(r);
    setUserName(name);
    if (r === 'admin') setScreen('adminDash');
    else if (r === 'teacher') setScreen('teacherDash');
    else setScreen('studentDash');
  };

  const handleLogout = () => {
    setRole(null);
    setUserName('');
    setScreen('login');
  };

  const goToAR = (category: string) => {
    setArCategory(category);
    setScreen('camera');
  };

  const goBack = () => {
    if (screen === 'camera') {
      setScreen(role === 'admin' ? 'adminDash' : role === 'teacher' ? 'teacherDash' : 'studentDash');
    } else if (screen === 'upload') {
      setScreen(role === 'admin' ? 'adminDash' : 'teacherDash');
    } else {
      setScreen('login');
    }
  };

  return (
    <SafeAreaProvider>
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'studentDash' && <StudentDashboard onBack={handleLogout} onStartAR={goToAR} userName={userName} />}
      {screen === 'teacherDash' && <TeacherDashboard onBack={handleLogout} onUpload={() => setScreen('upload')} userName={userName} />}
      {screen === 'adminDash' && <AdminDashboard onBack={handleLogout} onUpload={() => setScreen('upload')} userName={userName} />}
      {screen === 'camera' && <CameraScreen category={arCategory} onBack={goBack} />}
      {screen === 'upload' && <UploadScreen onBack={goBack} />}
    </SafeAreaProvider>
  );
}
