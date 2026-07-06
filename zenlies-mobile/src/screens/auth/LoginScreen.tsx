import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, ShieldAlert, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { RootStackNavigationProp } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation<RootStackNavigationProp<'Login'>>();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token;
      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        setError('Google Sign-In failed. Could not retrieve ID token.');
        setGoogleLoading(false);
      }
    } else if (response?.type === 'error') {
      setError('Google Sign-In failed. Please try again.');
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await api.googleLogin({ google_token: idToken });
      if (res.success && res.token && res.user) {
        loginStore(res.user, res.token);
      } else {
        setError(res.error || 'Google login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        loginStore(res.user, res.token);
      } else {
        setError(res.error || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header Section */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-white tracking-wider">
              Zen<Text className="text-indigo-500">lies</Text>
            </Text>
            <Text className="text-slate-400 text-sm mt-2">
              Sign in to manage your professional resumes
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
            <Text className="text-xl font-bold text-white mb-6">Welcome Back</Text>

            {/* Error Banner */}
            {error && (
              <View className="flex-row items-center bg-red-950/50 border border-red-500/30 rounded-2xl p-4 mb-5">
                <ShieldAlert size={20} color="#f87171" className="mr-3" />
                <Text className="text-red-400 text-sm flex-1">{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">EMAIL ADDRESS</Text>
              <View className="flex-row items-center bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <Mail size={20} color="#94a3b8" />
                <TextInput
                  placeholder="name@company.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 text-white text-base ml-3 py-0"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">PASSWORD</Text>
              <View className="flex-row items-center bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <Lock size={20} color="#94a3b8" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-white text-base ml-3 py-0"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity onPress={handleSignIn} disabled={loading} className="mb-6">
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-slate-700" />
              <Text className="text-slate-500 text-xs px-3 font-semibold uppercase tracking-wider">or</Text>
              <View className="flex-1 h-[1px] bg-slate-700" />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              onPress={() => promptAsync()}
              disabled={googleLoading || !request}
              className={`flex-row justify-center items-center bg-slate-900 border border-slate-700 hover:bg-slate-900/80 rounded-2xl py-4 mb-3 ${
                !request ? 'opacity-50' : ''
              }`}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-semibold">Continue with Google</Text>
              )}
            </TouchableOpacity>

            {!request && (
              <Text className="text-rose-400/80 text-[10px] text-center mb-4 px-2 leading-relaxed">
                Google Sign-In is unavailable because client IDs are not configured in your .env file.
              </Text>
            )}
          </View>

          {/* Footer Navigation */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-indigo-400 text-sm font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
