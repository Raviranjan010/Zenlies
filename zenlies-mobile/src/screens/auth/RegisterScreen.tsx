import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, FileText, ShieldAlert, Eye, EyeOff } from 'lucide-react-native';

import { RootStackNavigationProp } from '../../navigation/types';
import { api } from '../../services/api';

export default function RegisterScreen() {
  const navigation = useNavigation<RootStackNavigationProp<'Register'>>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.register({ name, email, password });
      if (res.success) {
        // Redirection to Otp Verify screen passing email as parameter
        navigation.navigate('Otp', { email });
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
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
              Create an account to start scanning resumes
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
            <Text className="text-xl font-bold text-white mb-6">Create Account</Text>

            {/* Error Banner */}
            {error && (
              <View className="flex-row items-center bg-red-950/50 border border-red-500/30 rounded-2xl p-4 mb-5">
                <ShieldAlert size={20} color="#f87171" className="mr-3" />
                <Text className="text-red-400 text-sm flex-1">{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">FULL NAME</Text>
              <View className="flex-row items-center bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <FileText size={20} color="#94a3b8" />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#64748b"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  className="flex-1 text-white text-base ml-3 py-0"
                />
              </View>
            </View>

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

            {/* Sign Up Button */}
            <TouchableOpacity onPress={handleSignUp} disabled={loading} className="mt-2">
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-400 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-indigo-400 text-sm font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
