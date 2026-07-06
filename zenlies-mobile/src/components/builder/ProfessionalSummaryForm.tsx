import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Sparkles, Wand2 } from 'lucide-react-native';
import { api } from '../../services/api';

export default function ProfessionalSummaryForm() {
  const { setValue, watch } = useFormContext();
  const summary = watch('professional_summary') || '';
  
  // Watch other fields for AI context
  const title = watch('personal_info.professional_title') || '';
  const skillsList = watch('skills') || [];
  const experienceList = watch('experience') || [];

  const [loading, setLoading] = useState(false);

  const handleEnhanceWithAI = async () => {
    if (!summary.trim()) {
      Alert.alert('Info', 'Please enter some text in the summary box first, so AI can enhance it.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.enhanceText({ text: summary });
      if (res.success && res.enhanced_text) {
        setValue('professional_summary', res.enhanced_text);
      } else {
        Alert.alert('Error', 'Failed to enhance summary.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred during text enhancement.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      // Package skills and experience
      const skills = skillsList.join(', ');
      const experience = experienceList.map((job: any) => 
        `${job.position} at ${job.company} (${job.start_date} - ${job.end_date}): ${job.description}`
      ).join('\n');

      const res = await api.generateSummary({
        professional_title: title,
        skills,
        experience,
        current_summary: summary,
      });

      if (res.success && res.summary) {
        setValue('professional_summary', res.summary);
      } else {
        Alert.alert('Error', 'Failed to generate summary.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred during summary generation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <Text className="text-xl font-bold text-white mb-6">Professional Summary</Text>
      <Text className="text-slate-400 text-xs mb-4">Write a brief overview of your professional career and objectives.</Text>

      {/* Text Area */}
      <View className="mb-6">
        <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
          <TextInput
            placeholder="Results-driven Software Engineer with 4+ years of experience designing web architectures..."
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={10}
            style={{ minHeight: 180, textAlignVertical: 'top' }}
            value={summary}
            onChangeText={(text) => setValue('professional_summary', text)}
            className="text-white text-sm py-0"
          />
        </View>
      </View>

      {/* AI Controls */}
      <View className="flex-row justify-between mb-4">
        {/* Enhance with AI */}
        <TouchableOpacity
          onPress={handleEnhanceWithAI}
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 py-3.5 rounded-2xl mr-2 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Wand2 size={16} color="#818cf8" className="mr-2" />
              <Text className="text-indigo-400 text-sm font-semibold">Enhance with AI</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Generate Summary */}
        <TouchableOpacity
          onPress={handleGenerateSummary}
          disabled={loading}
          className="flex-1 bg-indigo-600 py-3.5 rounded-2xl ml-2 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Sparkles size={16} color="#ffffff" className="mr-2" />
              <Text className="text-white text-sm font-semibold">Generate Summary</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <Text className="text-indigo-400 text-xs font-medium text-center mt-2">
          Gemini is thinking... This may take a moment.
        </Text>
      )}
    </ScrollView>
  );
}
