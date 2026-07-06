import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Mail, LogOut, ShieldAlert, Moon, Sun } from 'lucide-react-native';

import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { api } from '../../services/api';

export default function ProfileScreen() {
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call backend logout endpoint
      await api.logout();
    } catch (err: any) {
      console.warn('Backend logout failed or offline:', err.message);
      // We log the error but still proceed with local logout so the user isn't stuck
    } finally {
      setLoading(false);
      // Clear store (automatically redirects to Auth flow)
      logoutStore();
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-900 px-6">
      <View className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 shadow-2xl items-center">
        {/* Avatar Placeholder */}
        <View className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full justify-center items-center mb-6">
          <User size={40} color="#6366f1" />
        </View>

        <Text className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
          {user?.full_name || 'Zenlies User'}
        </Text>
        
        <View className="flex-row items-center mb-4">
          <Mail size={16} color="#64748b" className="mr-2" />
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Theme Settings Switcher */}
        <View className="w-full border-t border-b border-slate-100 dark:border-slate-700/50 py-4 my-6 flex-row justify-between items-center px-1">
          <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Theme Settings</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            className="flex-row items-center bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl"
          >
            {theme === 'dark' ? (
              <>
                <Moon size={14} color="#818cf8" className="mr-1.5" />
                <Text className="text-indigo-400 text-xs font-bold">Dark Mode</Text>
              </>
            ) : (
              <>
                <Sun size={14} color="#ea580c" className="mr-1.5" />
                <Text className="text-orange-600 text-xs font-bold">Light Mode</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View className="flex-row items-center bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 mb-5 w-full">
            <ShieldAlert size={20} color="#f87171" className="mr-3" />
            <Text className="text-red-600 dark:text-red-400 text-sm flex-1">{error}</Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleLogout}
          disabled={loading}
          className="w-full bg-red-600/90 hover:bg-red-600 border border-red-500/30 py-4 rounded-2xl flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <LogOut size={18} color="#ffffff" className="mr-2" />
              <Text className="text-white text-base font-semibold">Log Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
