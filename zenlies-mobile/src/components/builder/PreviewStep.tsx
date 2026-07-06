import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { FileText, Download, Save, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import { api } from '../../services/api';

export default function PreviewStep() {
  const { getValues, setValue, watch } = useFormContext();
  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');

  const formData = getValues();
  const personalInfo = formData.personal_info || {};
  const summary = formData.professional_summary || '';
  const experience = formData.experience || [];
  const education = formData.education || [];
  const skills = formData.skills || [];
  const projects = formData.project || [];
  const certifications = formData.certification || [];

  const saveMutation = useMutation({
    mutationFn: api.saveResume,
    onSuccess: (data) => {
      if (data.success) {
        Alert.alert('Success', 'Resume saved successfully!');
        queryClient.invalidateQueries({ queryKey: ['resumes'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', 'Failed to save resume.');
      }
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'An error occurred while saving.');
    },
  });

  const handleSave = () => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'Saving resumes is disabled when offline. Please reconnect to the internet to save.');
      return;
    }

    const payload = {
      title: formData.title || `${personalInfo.full_name || 'My'} Resume`,
      category: personalInfo.professional_title || 'General',
      resume_data: formData,
      ats_score: formData.ats_score || 0,
    };

    saveMutation.mutate(payload);
  };

  const handleDownload = async () => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'Downloading documents is disabled when offline. Please reconnect to the internet.');
      return;
    }
    setDownloading(true);
    try {
      const res = await api.downloadDocx(formData);
      if (res.success && res.docx_b64) {
        const filename = `${(personalInfo.full_name || 'Resume').replace(/\s+/g, '_')}_Builder.docx`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, res.docx_b64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            dialogTitle: 'Download Resume',
            UTI: 'com.microsoft.word.doc',
          });
        } else {
          Alert.alert('Error', 'Native sharing is not supported on this device.');
        }
      } else {
        Alert.alert('Error', 'Failed to generate Word document.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred during download.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
      <Text className="text-xl font-bold text-white mb-6">Review & Export</Text>

      {/* Resume Document Title */}
      <Text className="text-slate-400 text-xs font-semibold mb-3 ml-1">RESUME DOCUMENT TITLE</Text>
      <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3 mb-6">
        <TextInput
          placeholder="e.g. Software Engineer Resume"
          placeholderTextColor="#64748b"
          value={watch('title') || ''}
          onChangeText={(text) => setValue('title', text)}
          className="text-white text-sm py-0"
        />
      </View>

      {/* Template Selector */}
      <Text className="text-slate-400 text-xs font-semibold mb-3 ml-1">CHOOSE TEMPLATE</Text>
      <View className="flex-row mb-6">
        <TouchableOpacity
          onPress={() => setSelectedTemplate('classic')}
          className={`flex-1 p-4 rounded-2xl border-2 mr-2 flex-row items-center justify-between ${
            selectedTemplate === 'classic' ? 'border-indigo-500 bg-slate-800' : 'border-slate-700 bg-slate-900/40'
          }`}
        >
          <View className="flex-row items-center">
            <FileText size={20} color={selectedTemplate === 'classic' ? '#818cf8' : '#64748b'} className="mr-3" />
            <Text className="text-white text-sm font-semibold">Classic Professional</Text>
          </View>
          {selectedTemplate === 'classic' && <CheckCircle size={16} color="#818cf8" />}
        </TouchableOpacity>
      </View>

      {/* Live Preview Container */}
      <Text className="text-slate-400 text-xs font-semibold mb-3 ml-1">LIVE PREVIEW</Text>
      <View className="bg-white rounded-3xl p-6 mb-8 shadow-xl">
        {/* Header */}
        <View className="border-b border-slate-200 pb-4 mb-4 items-center">
          <Text className="text-slate-800 text-xl font-bold text-center">
            {personalInfo.full_name || 'Your Name'}
          </Text>
          <Text className="text-indigo-600 text-xs font-semibold uppercase tracking-wider text-center mt-1">
            {personalInfo.professional_title || 'Professional Title'}
          </Text>
          <Text className="text-slate-500 text-[10px] text-center mt-2 leading-relaxed">
            {[
              personalInfo.email,
              personalInfo.phone,
              personalInfo.city && `${personalInfo.city}, ${personalInfo.state || ''}`,
              personalInfo.website,
            ].filter(Boolean).join('  |  ')}
          </Text>
        </View>

        {/* Summary */}
        {summary ? (
          <View className="mb-4">
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-1.5">Professional Summary</Text>
            <Text className="text-slate-700 text-xs leading-relaxed">{summary}</Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {experience.length > 0 ? (
          <View className="mb-4">
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-2">Work Experience</Text>
            {experience.map((job: any, index: number) => (
              <View key={index} className="mb-3">
                <View className="flex-row justify-between items-start">
                  <Text className="text-slate-800 text-xs font-bold">{job.position || 'Position'}</Text>
                  <Text className="text-slate-500 text-[10px]">{job.start_date} - {job.end_date || 'Present'}</Text>
                </View>
                <Text className="text-indigo-500 text-[10px] font-semibold">{job.company || 'Company'}</Text>
                {job.description ? (
                  <Text className="text-slate-600 text-[10px] mt-1 leading-relaxed">{job.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View className="mb-4">
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-2">Education</Text>
            {education.map((edu: any, index: number) => (
              <View key={index} className="mb-2">
                <View className="flex-row justify-between items-start">
                  <Text className="text-slate-800 text-xs font-bold">{edu.degree || 'Degree'} in {edu.field || 'Field'}</Text>
                  <Text className="text-slate-500 text-[10px]">{edu.graduation_date}</Text>
                </View>
                <Text className="text-slate-600 text-[10px]">{edu.institution || 'Institution'} {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View className="mb-4">
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-2">Projects</Text>
            {projects.map((proj: any, index: number) => (
              <View key={index} className="mb-3">
                <View className="flex-row justify-between items-start">
                  <Text className="text-slate-800 text-xs font-bold">{proj.title || 'Project'}</Text>
                  {proj.technologies ? (
                    <Text className="text-slate-500 text-[8px] font-semibold bg-slate-100 px-1 py-0.5 rounded">
                      {proj.technologies}
                    </Text>
                  ) : null}
                </View>
                {proj.role ? (
                  <Text className="text-indigo-500 text-[9px] font-semibold">{proj.role}</Text>
                ) : null}
                {proj.description ? (
                  <Text className="text-slate-600 text-[9px] mt-1 leading-relaxed">{proj.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certifications.length > 0 ? (
          <View className="mb-4">
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-2">Certifications</Text>
            {certifications.map((cert: any, index: number) => (
              <View key={index} className="mb-2">
                <View className="flex-row justify-between items-start">
                  <Text className="text-slate-800 text-xs font-bold">{cert.name || 'Certification'}</Text>
                  <Text className="text-slate-500 text-[8px] font-mono">{cert.date || cert.issue_date}</Text>
                </View>
                <Text className="text-slate-600 text-[9px]">{cert.issuer || 'Issuer'}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {skills.length > 0 ? (
          <View>
            <Text className="text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-2">Skills</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {skills.map((skill: string, index: number) => (
                <View key={index} className="bg-slate-100 px-2 py-1 rounded">
                  <Text className="text-slate-700 text-[9px] font-medium">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {/* Export Actions */}
      <View className="flex-row justify-between">
        {/* Save Resume */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saveMutation.isPending || downloading}
          className={`flex-1 py-4 rounded-2xl mr-2 flex-row justify-center items-center border ${
            isOffline 
              ? 'bg-slate-800/40 border-slate-800/20' 
              : 'bg-slate-800 border-slate-700'
          }`}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Save size={18} color={isOffline ? '#64748b' : '#ffffff'} className="mr-2" />
              <Text className={`text-base font-semibold ${isOffline ? 'text-slate-500' : 'text-white'}`}>
                {isOffline ? 'Offline' : 'Save Resume'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Download Word Doc */}
        <TouchableOpacity
          onPress={handleDownload}
          disabled={saveMutation.isPending || downloading}
          className={`flex-1 py-4 rounded-2xl ml-2 flex-row justify-center items-center border ${
            isOffline 
              ? 'bg-slate-800/40 border-slate-800/20' 
              : 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20'
          }`}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Download size={18} color={isOffline ? '#64748b' : '#ffffff'} className="mr-2" />
              <Text className={`text-base font-semibold ${isOffline ? 'text-slate-500' : 'text-white'}`}>
                {isOffline ? 'Offline' : 'Download Docx'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
