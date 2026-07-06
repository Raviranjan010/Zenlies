import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, Plus, Trash2, Calendar, FileQuestion, Sparkles, Award, BarChart2, ChevronRight, WifiOff } from 'lucide-react-native';
import { useNetInfo } from '@react-native-community/netinfo';

import { MainTabNavigationProp } from '../../navigation/types';
import { api, Resume } from '../../services/api';

const GRADIENTS: readonly (readonly [string, string])[] = [
  ['#60a5fa', '#2563eb'], // Blue
  ['#c084fc', '#9333ea'], // Purple
  ['#4ade80', '#16a34a'], // Green
  ['#fb923c', '#ea580c'], // Orange
  ['#f472b6', '#db2777'], // Pink
  ['#818cf8', '#4f46e5'], // Indigo
];

export default function DashboardScreen() {
  const navigation = useNavigation<MainTabNavigationProp<'Dashboard'>>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  // Queries
  const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  });

  const { data: resumesData, isLoading: isResumesLoading, refetch: refetchResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: api.listResumes,
  });

  // Delete Mutation with Optimistic Updates
  const deleteMutation = useMutation({
    mutationFn: api.deleteResume,
    onMutate: async (id: number) => {
      // Cancel outgoing refetch queries to prevent overwriting optimistic state
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // Snapshot previous cache state
      const previousResumes = queryClient.getQueryData<{ success: boolean; resumes: Resume[] }>(['resumes']);

      // Optimistically update resumes list in cache
      queryClient.setQueryData<{ success: boolean; resumes: Resume[] }>(['resumes'], (old) => {
        if (!old) return old;
        return {
          ...old,
          resumes: old.resumes.filter((r) => r.id !== id),
        };
      });

      return { previousResumes };
    },
    onError: (err, id, context) => {
      // Rollback to previous state if mutation fails
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
      Alert.alert('Error', 'Failed to delete resume. Please check your connection and try again.');
    },
    onSettled: () => {
      // Sync cache with backend state
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleDeleteConfirm = (resume: Resume) => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'Deleting resumes is disabled when offline.');
      return;
    }
    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${resume.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(resume.id),
        },
      ],
      { cancelable: true }
    );
  };

  const handleCreateNewResume = () => {
    if (isOffline) {
      Alert.alert(
        'Offline Mode',
        'Creating resumes is disabled when offline. Please reconnect to the internet to build a new resume.'
      );
    } else {
      navigation.navigate('Builder');
    }
  };

  const onRefresh = async () => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'Cannot refresh dashboard while offline.');
      return;
    }
    setRefreshing(true);
    await Promise.all([refetchDashboard(), refetchResumes()]);
    setRefreshing(false);
  };

  const renderResumeCard = ({ item, index }: { item: Resume; index: number }) => {
    const cardGradients = GRADIENTS[index % GRADIENTS.length];
    const scoreColor = item.ats_score && item.ats_score >= 70 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
      : item.ats_score && item.ats_score >= 50 
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
        : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

    return (
      <View className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden mb-4 shadow-sm dark:shadow-lg">
        {/* Card colored gradient header strip */}
        <LinearGradient
          colors={cardGradients}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-2 w-full"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ResumePreview', { resumeId: String(item.id) })}
          className="p-5"
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1 mr-3">
              <Text className="text-slate-800 dark:text-white text-lg font-bold mb-1" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
                {item.category || 'General'}
              </Text>
              
              {/* Date */}
              <View className="flex-row items-center">
                <Calendar size={14} color="#64748b" className="mr-1.5" />
                <Text className="text-slate-500 dark:text-slate-400 text-xs">
                  Updated: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Score and actions */}
            <View className="items-end justify-between h-20">
              {item.ats_score !== undefined && item.ats_score !== null ? (
                <View className={`border px-3 py-1 rounded-full ${scoreColor}`}>
                  <Text className="text-xs font-bold font-mono">ATS: {Math.round(item.ats_score)}%</Text>
                </View>
              ) : (
                <View className="border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 px-3 py-1 rounded-full">
                  <Text className="text-slate-500 text-xs font-bold">Unscored</Text>
                </View>
              )}

              <TouchableOpacity 
                onPress={() => handleDeleteConfirm(item)}
                disabled={isOffline}
                className={`p-2 border rounded-xl ${
                  isOffline 
                    ? 'bg-slate-100 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/20 opacity-30' 
                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <Trash2 size={16} color={isOffline ? '#64748b' : '#f87171'} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => {
    const stats = dashboardData?.stats;
    const name = dashboardData?.user?.name || 'User';

    return (
      <View className="mb-6">
        {/* Welcome Section */}
        <View className="flex-row items-center mb-6">
          <Sparkles size={24} color="#6366f1" className="mr-2" />
          <Text className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</Text>
        </View>

        <Text className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Welcome back, <Text className="text-slate-800 dark:text-white font-semibold">{name}</Text>! Check your ATS performance.
        </Text>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-2">
          {/* Total Resumes */}
          <View className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 flex-1 mr-2 items-center shadow-sm dark:shadow-lg">
            <FileText size={20} color="#6366f1" className="mb-2" />
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Resumes</Text>
            <Text className="text-slate-800 dark:text-white text-xl font-extrabold mt-1">{stats?.total_resumes ?? 0}</Text>
          </View>

          {/* Average Score */}
          <View className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 flex-1 mx-1 items-center shadow-sm dark:shadow-lg">
            <BarChart2 size={20} color="#10b981" className="mb-2" />
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Avg ATS</Text>
            <Text className="text-slate-800 dark:text-white text-xl font-extrabold mt-1">{stats?.avg_score ?? 0}%</Text>
          </View>

          {/* Best Score */}
          <View className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 flex-1 ml-2 items-center shadow-sm dark:shadow-lg">
            <Award size={20} color="#f59e0b" className="mb-2" />
            <Text className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">Best Score</Text>
            <Text className="text-slate-800 dark:text-white text-xl font-extrabold mt-1">{stats?.best_score ?? 0}%</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View className="bg-slate-800/50 border border-slate-700/30 rounded-3xl p-8 items-center mt-4">
        <FileQuestion size={48} color="#6366f1" className="mb-4" />
        <Text className="text-white text-lg font-bold mb-2">No Saved Resumes</Text>
        <Text className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
          You haven't built or saved any resumes yet. Start creating your professional profile now.
        </Text>
        <TouchableOpacity
          onPress={handleCreateNewResume}
          className={`px-6 py-3.5 rounded-2xl flex-row items-center shadow-lg ${
            isOffline
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
          }`}
        >
          <Plus size={18} color={isOffline ? '#64748b' : '#ffffff'} className="mr-2" />
          <Text className={`font-semibold text-sm ${isOffline ? 'text-slate-500' : 'text-white'}`}>
            {isOffline ? 'Offline Mode' : 'Create New Resume'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Full Screen Loading state
  const isInitialLoading = (isDashboardLoading || isResumesLoading) && !refreshing;
  const resumes = resumesData?.resumes || [];

  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 pt-6">
        {/* Header Skeleton */}
        <View className="mb-6">
          <View className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 animate-pulse" />
          <View className="w-64 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 animate-pulse" />
          
          {/* Stats Grid Skeleton */}
          <View className="flex-row justify-between mb-2">
            <View className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/30 rounded-2xl p-4 flex-1 mr-2 items-center h-24 justify-center animate-pulse" />
            <View className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/30 rounded-2xl p-4 flex-1 mx-1 items-center h-24 justify-center animate-pulse" />
            <View className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/30 rounded-2xl p-4 flex-1 ml-2 items-center h-24 justify-center animate-pulse" />
          </View>
        </View>

        {/* Cards Skeleton */}
        <View className="flex-1 animate-pulse">
          <View className="bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/30 rounded-3xl p-5 mb-4 h-32" />
          <View className="bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/30 rounded-3xl p-5 mb-4 h-32" />
          <View className="bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/30 rounded-3xl p-5 mb-4 h-32" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-900 relative">
      {/* Offline Banner */}
      {isOffline && (
        <View className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex-row justify-center items-center">
          <WifiOff size={14} color="#f59e0b" className="mr-2" />
          <Text className="text-amber-500 text-xs font-semibold">
            You are offline. Showing cached resumes (read-only mode)
          </Text>
        </View>
      )}

      <FlatList
        data={resumes}
        renderItem={renderResumeCard}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      {resumes.length > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreateNewResume}
          className="absolute bottom-6 right-6"
        >
          <LinearGradient
            colors={isOffline ? ['#334155', '#1e293b'] : ['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className={`w-14 h-14 rounded-full justify-center items-center shadow-xl ${
              isOffline ? 'border border-slate-700/50' : 'shadow-indigo-500/30'
            }`}
          >
            <Plus size={28} color={isOffline ? '#64748b' : '#ffffff'} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}
