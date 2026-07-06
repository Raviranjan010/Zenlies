import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, X, FileText, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { MainTabNavigationProp } from '../../navigation/types';
import { api, AnalyzeResumeResponse } from '../../services/api';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const CIRCLE_RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function HomeScreen() {
  const navigation = useNavigation<MainTabNavigationProp<'Home'>>();

  // Form states
  const [pickedFile, setPickedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [category, setCategory] = useState('');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResumeResponse | null>(null);
  const [displayScore, setDisplayScore] = useState(0);

  // Animation values
  const progress = useSharedValue(0);

  // Update animated values when results arrive
  useEffect(() => {
    if (result) {
      // Animate SVG stroke circle
      progress.value = 0;
      progress.value = withTiming(result.ats_score / 100, { duration: 1500 });

      // Animate score counter text
      let current = 0;
      const target = result.ats_score;
      if (target === 0) {
        setDisplayScore(0);
        return;
      }
      const duration = 1500;
      const step = Math.ceil(target / (duration / 16)); // ~60fps
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDisplayScore(current);
      }, 16);

      return () => clearInterval(timer);
    } else {
      progress.value = 0;
      setDisplayScore(0);
    }
  }, [result]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const handlePickDocument = async () => {
    setValidationError(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPickedFile(res.assets[0]);
      }
    } catch (err) {
      console.error('Document Picker Error:', err);
    }
  };

  const handleClearFile = () => {
    setPickedFile(null);
  };

  const handleAnalyze = async () => {
    // Validation: must provide resume file OR (category AND job description)
    const hasResume = !!pickedFile;
    const hasJdAndCategory = !!jobDescription && !!category;

    if (!hasResume && !hasJdAndCategory) {
      setValidationError(
        'Please upload a resume, or provide both a Job Description and a Category/Stream.'
      );
      return;
    }

    setValidationError(null);
    setApiError(null);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();

      if (pickedFile) {
        // Construct the multipart file object for React Native
        const fileObj = {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/octet-stream',
        };
        formData.append('resume', fileObj as any);
      }

      if (jobDescription) {
        formData.append('job_description', jobDescription);
      }

      if (category) {
        formData.append('stream_or_category', category);
      }

      const res = await api.analyzeResume(formData);
      if (res.success) {
        setResult(res);
      } else {
        setApiError(res.error || 'Failed to analyze resume.');
      }
    } catch (err: any) {
      setApiError(err.message || 'An error occurred during resume analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-6 py-6">
        
        {/* Title */}
        <View className="flex-row items-center mb-6">
          <Sparkles size={24} color="#6366f1" className="mr-2" />
          <Text className="text-2xl font-bold text-white">Resume Analyzer</Text>
        </View>

        {/* Input Card Container */}
        <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-5 shadow-xl mb-6">
          <Text className="text-white text-base font-bold mb-4">Analyze New Profile</Text>

          {/* Validation Error */}
          {validationError && (
            <View className="flex-row items-center bg-red-950/50 border border-red-500/30 rounded-2xl p-4 mb-4">
              <AlertCircle size={20} color="#f87171" className="mr-3" />
              <Text className="text-red-400 text-xs flex-1">{validationError}</Text>
            </View>
          )}

          {/* API Error */}
          {apiError && (
            <View className="flex-row items-center bg-red-950/50 border border-red-500/30 rounded-2xl p-4 mb-4">
              <AlertCircle size={20} color="#f87171" className="mr-3" />
              <Text className="text-red-400 text-xs flex-1">{apiError}</Text>
            </View>
          )}

          {/* Upload Area */}
          <View className="mb-5">
            <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">UPLOAD RESUME (PDF, DOCX, TXT)</Text>
            {!pickedFile ? (
              <TouchableOpacity
                onPress={handlePickDocument}
                className="border-2 border-dashed border-slate-600 hover:border-indigo-500/50 bg-slate-900/40 rounded-2xl py-6 justify-center items-center"
              >
                <Upload size={32} color="#6366f1" className="mb-2" />
                <Text className="text-slate-300 font-semibold text-sm">Select Document</Text>
                <Text className="text-slate-500 text-xs mt-1">PDF, DOCX, or TXT up to 5MB</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <FileText size={28} color="#6366f1" />
                <View className="flex-1 ml-3 mr-2">
                  <Text className="text-white text-sm font-semibold truncate" numberOfLines={1}>
                    {pickedFile.name}
                  </Text>
                  {pickedFile.size && (
                    <Text className="text-slate-500 text-xs">
                      {(pickedFile.size / 1024).toFixed(1)} KB
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={handleClearFile} className="p-1">
                  <X size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stream Category */}
          <View className="mb-4">
            <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">STREAM / TARGET CATEGORY (OPTIONAL)</Text>
            <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
              <TextInput
                placeholder="e.g. Software Engineer, Product Manager"
                placeholderTextColor="#64748b"
                value={category}
                onChangeText={setCategory}
                className="text-white text-sm py-0"
              />
            </View>
          </View>

          {/* Job Description */}
          <View className="mb-6">
            <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">JOB DESCRIPTION (OPTIONAL)</Text>
            <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
              <TextInput
                placeholder="Paste the target job description here..."
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={Platform.OS === 'ios' ? 0 : 4}
                style={{ minHeight: 80, textAlignVertical: 'top' }}
                value={jobDescription}
                onChangeText={setJobDescription}
                className="text-white text-sm py-0"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleAnalyze} disabled={loading}>
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Sparkles size={18} color="#ffffff" className="mr-2" />
                  <Text className="text-white text-base font-semibold">Analyze Profile</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Loading Skeleton Simulation */}
        {loading && (
          <View className="bg-slate-800/50 border border-slate-700/30 rounded-3xl p-6 items-center">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-slate-300 font-semibold mt-4 text-base">Gemini is analyzing your profile...</Text>
            <Text className="text-slate-500 text-xs mt-1 text-center px-6">
              Scanning keywords, calculating matching indices, and extracting skills.
            </Text>
          </View>
        )}

        {/* Result Area */}
        {result && (
          <Animated.View 
            entering={FadeInDown.duration(800).springify()} 
            exiting={FadeOut}
            className="space-y-6"
          >
            {/* Main Score Card */}
            <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-xl items-center mb-6">
              <Text className="text-slate-400 text-xs font-semibold tracking-wider mb-4 uppercase">ATS Matching Score</Text>
              
              {/* Custom SVG gauge progress ring */}
              <View className="relative w-[100px] h-[100px] justify-center items-center">
                <Svg width="100" height="100" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <Circle
                    cx="50"
                    cy="50"
                    r={CIRCLE_RADIUS}
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Animated Circular Progress indicator */}
                  <AnimatedCircle
                    cx="50"
                    cy="50"
                    r={CIRCLE_RADIUS}
                    stroke="#6366f1"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE}
                    animatedProps={animatedCircleProps}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="50, 50"
                  />
                </Svg>
                
                {/* Score Number overlay */}
                <View className="absolute justify-center items-center">
                  <Text className="text-white text-2xl font-extrabold">{displayScore}%</Text>
                </View>
              </View>

              {/* Category Badge */}
              <View className="mt-5 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
                <Text className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Category: {result.category || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Skills Chip Lists */}
            <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-xl mb-6">
              <Text className="text-white text-base font-bold mb-4">Detected Skills</Text>
              {result.detected_skills && result.detected_skills.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {result.detected_skills.map((skill, index) => (
                    <View key={index} className="bg-indigo-950/40 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                      <Text className="text-indigo-400 text-xs font-medium">{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-slate-500 text-sm">No specific skills detected.</Text>
              )}
            </View>

            {/* Missing Keywords Lists */}
            <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-xl mb-6">
              <Text className="text-white text-base font-bold mb-4 text-rose-400">Missing Keywords</Text>
              {result.missing_keywords && result.missing_keywords.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {result.missing_keywords.map((keyword, index) => (
                    <View key={index} className="bg-rose-950/40 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                      <Text className="text-rose-400 text-xs font-medium">{keyword}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-emerald-400 text-sm flex-row items-center">
                  <CheckCircle2 size={16} className="mr-2" /> Excellent! No key job description keywords missing.
                </Text>
              )}
            </View>

            {/* Suggestions card list */}
            <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-xl mb-6">
              <Text className="text-white text-base font-bold mb-4">Improvement Suggestions</Text>
              {result.suggestions && result.suggestions.length > 0 ? (
                <View className="space-y-3">
                  {result.suggestions.map((suggestion, index) => (
                    <View key={index} className="flex-row items-start bg-slate-900/40 border border-slate-700/30 rounded-2xl p-4">
                      <ChevronRight size={16} color="#6366f1" className="mt-0.5 mr-2" />
                      <Text className="text-slate-300 text-sm flex-1 leading-relaxed">
                        {suggestion}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-slate-500 text-sm">No improvement recommendations suggested.</Text>
              )}
            </View>

            {/* Open Preview Screen button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('ResumePreview')}
              className="w-full bg-slate-800 border border-slate-700 py-4 rounded-2xl flex-row justify-center items-center shadow"
            >
              <Text className="text-white text-base font-semibold mr-2">Open Resume Preview</Text>
              <ChevronRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}
