import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useAuth} from '../utils/AuthContext';
import {RootStackParamList} from '../types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Student Screens
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import CategoryDetailScreen from '../screens/student/CategoryDetailScreen';
import ARViewScreen from '../screens/student/ARViewScreen';

// Teacher Screens
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import UploadModelScreen from '../screens/teacher/UploadModelScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminARModelsScreen from '../screens/admin/AdminARModelsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function StudentStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="ARView" component={ARViewScreen} />
    </Stack.Navigator>
  );
}

function TeacherStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <Stack.Screen name="UploadModel" component={UploadModelScreen} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ARModels" component={AdminARModelsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#0F0C29',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color="#9B59B6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!user ? (
          // Unauthenticated
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : user.role === 'student' ? (
          <Stack.Screen name="StudentRoot" component={StudentStack} />
        ) : user.role === 'teacher' ? (
          <Stack.Screen name="TeacherRoot" component={TeacherStack} />
        ) : (
          <Stack.Screen name="AdminRoot" component={AdminStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
