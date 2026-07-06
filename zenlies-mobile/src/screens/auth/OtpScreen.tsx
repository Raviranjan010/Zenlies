import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, ArrowLeft } from 'lucide-react-native';

import { RootStackParamList, RootStackNavigationProp } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

export default function OtpScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Otp'>>();
  const navigation = useNavigation<RootStackNavigationProp<'Otp'>>();
  const loginStore = useAuthStore((state) => state.login);

  const email = route.params?.email || 'user@example.com';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const textInputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await api.verifyOtp({ email, otp });
      if (res.success && res.token && res.user) {
        loginStore(res.user, res.token);
      } else {
        setError(res.error || 'Invalid OTP code.');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await api.resendOtp({ email });
      if (res.success) {
        setInfoMessage('OTP has been successfully resent to your email.');
      } else {
        setError(res.error || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // Click handler to focus the hidden text input
  const handlePressCells = () => {
    textInputRef.current?.focus();
  };

  const renderCells = () => {
    const cells = [];
    for (let i = 0; i < 6; i++) {
      const digit = otp[i] || '';
      const isFocused = otp.length === i;
      
      cells.push(
        <View
          key={i}
          className={`w-12 h-14 bg-slate-900 border-2 rounded-2xl justify-center items-center ${
            isFocused ? 'border-indigo-500 bg-slate-900' : 'border-slate-700 bg-slate-900/60'
          }`}
        >
          <Text className="text-white text-xl font-bold">{digit}</Text>
        </View>
      );
    }
    return cells;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Back Navigation Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-6 self-start"
          >
            <ArrowLeft size={18} color="#94a3b8" />
            <Text className="text-slate-400 text-sm ml-2">Back</Text>
          </TouchableOpacity>

          {/* Header Section */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-white tracking-wider">
              Zen<Text className="text-indigo-500">lies</Text>
            </Text>
            <Text className="text-slate-400 text-sm mt-3 text-center px-4">
              Enter the 6-digit OTP code sent to:
            </Text>
            <Text className="text-indigo-400 text-sm font-semibold mt-1">
              {email}
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-2xl items-center">
            <Text className="text-xl font-bold text-white mb-2 self-start">Verification Code</Text>
            <Text className="text-slate-400 text-xs mb-6 self-start">We've sent a 6-digit verification code</Text>

            {/* Error Banner */}
            {error && (
              <View className="flex-row items-center bg-red-950/50 border border-red-500/30 rounded-2xl p-4 mb-5 w-full">
                <ShieldAlert size={20} color="#f87171" className="mr-3" />
                <Text className="text-red-400 text-sm flex-1">{error}</Text>
              </View>
            )}

            {/* Info Success Banner */}
            {infoMessage && (
              <View className="flex-row items-center bg-indigo-950/50 border border-indigo-500/30 rounded-2xl p-4 mb-5 w-full">
                <Text className="text-indigo-400 text-sm flex-1">{infoMessage}</Text>
              </View>
            )}

            {/* OTP Code Box Visualizer */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handlePressCells}
              className="flex-row justify-between w-full mb-8 px-2"
            >
              {renderCells()}
            </TouchableOpacity>

            {/* Hidden TextInput for keyboard input */}
            <TextInput
              ref={textInputRef}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              maxLength={6}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              className="absolute w-0 h-0 opacity-0"
              caretHidden
            />

            {/* Verify Button */}
            <TouchableOpacity onPress={handleVerify} disabled={loading} className="w-full mb-6">
              <LinearGradient
                colors={['#6366f1', '#4f46e5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white text-base font-semibold">Verify Code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Link */}
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-slate-400 text-sm">Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color="#818cf8" className="ml-1" />
                ) : (
                  <Text className="text-indigo-400 text-sm font-semibold">Resend code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
