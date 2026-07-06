import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, MainTabParamList } from './types';
import { useAuthStore } from '../store/authStore';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import HomeScreen from '../screens/main/HomeScreen';
import DashboardScreen from '../screens/main/DashboardScreen';
import BuilderScreen from '../screens/main/BuilderScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ResumePreviewScreen from '../screens/shared/ResumePreviewScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#64748b',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Builder" component={BuilderScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-slate-500 font-medium">Initializing Zenlies...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
        }}
      >
        {isAuthenticated ? (
          <>
            <RootStack.Screen 
              name="MainTabs" 
              component={TabNavigator} 
              options={{ headerShown: false }}
            />
            <RootStack.Screen 
              name="ResumePreview" 
              component={ResumePreviewScreen} 
              options={{ 
                presentation: 'modal',
                title: 'Resume Preview',
              }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ title: 'Sign In' }}
            />
            <RootStack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Register' }}
            />
            <RootStack.Screen 
              name="Otp" 
              component={OtpScreen} 
              options={{ title: 'Verification' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
