import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useNetInfo } from '@react-native-community/netinfo';
import { Mail, Phone, Globe, MapPin, Briefcase, GraduationCap, Award, Sparkles, X, WifiOff, FileText } from 'lucide-react-native';

import { RootStackParamList, RootStackNavigationProp } from '../../navigation/types';
import { api } from '../../services/api';

export default function ResumePreviewScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ResumePreview'>>();
  const navigation = useNavigation<RootStackNavigationProp<'ResumePreview'>>();
  const resumeId = route.params?.resumeId;
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;

  const { data: resumeResponse, isLoading, error } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => api.getResume(Number(resumeId)),
    enabled: !!resumeId,
  });

  const resume = resumeResponse?.resume;

  const parsedData = React.useMemo(() => {
    if (!resume?.resume_json) return null;
    try {
      return JSON.parse(resume.resume_json);
    } catch (e) {
      console.error('Failed to parse resume_json:', e);
      return null;
    }
  }, [resume?.resume_json]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-slate-400 text-sm mt-4 font-semibold">Loading Resume Preview...</Text>
      </View>
    );
  }

  if (error || !resume) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-900 p-6">
        <WifiOff size={48} color="#f87171" className="mb-4" />
        <Text className="text-white text-lg font-bold mb-2">Failed to Load Resume</Text>
        <Text className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
          {isOffline 
            ? "You are offline and this resume isn't cached locally. Please reconnect to view it." 
            : "An error occurred while fetching the resume."}
        </Text>
        <TouchableOpacity 
          className="bg-indigo-600 px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const personalInfo = parsedData?.personal_info || {};
  const summary = parsedData?.professional_summary || '';
  const experience = parsedData?.experience || [];
  const education = parsedData?.education || [];
  const skills = parsedData?.skills || [];
  const projects = parsedData?.project || [];
  const certifications = parsedData?.certification || [];

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header bar */}
      <View className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/50 flex-row justify-between items-center">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-bold" numberOfLines={1}>
            {resume.title}
          </Text>
          {isOffline && (
            <View className="flex-row items-center mt-0.5">
              <WifiOff size={10} color="#fb923c" className="mr-1" />
              <Text className="text-amber-500 text-[10px] font-semibold">Offline Mode (Read-Only)</Text>
            </View>
          )}
        </View>

        {/* ATS Score display */}
        {resume.ats_score !== undefined && resume.ats_score !== null && (
          <View className="bg-indigo-950 border border-indigo-500/30 px-3 py-1 rounded-full mr-3">
            <Text className="text-indigo-400 text-xs font-bold font-mono">ATS: {Math.round(resume.ats_score)}%</Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="p-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/30 rounded-full"
        >
          <X size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {parsedData ? (
          /* Structured Resume Sheet Document Style */
          <View className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
            {/* Header Contact details */}
            <View className="border-b border-slate-200 pb-4 mb-4 items-center">
              <Text className="text-slate-800 text-2xl font-bold text-center">
                {personalInfo.full_name || 'No Name Provided'}
              </Text>
              {personalInfo.professional_title ? (
                <Text className="text-indigo-600 text-sm font-semibold uppercase tracking-wider text-center mt-1">
                  {personalInfo.professional_title}
                </Text>
              ) : null}

              {/* Contact Grid */}
              <View className="flex-row flex-wrap justify-center mt-3 gap-x-4 gap-y-1.5 font-sans">
                {personalInfo.email && (
                  <View className="flex-row items-center">
                    <Mail size={12} color="#64748b" className="mr-1" />
                    <Text className="text-slate-500 text-[10px]">{personalInfo.email}</Text>
                  </View>
                )}
                {personalInfo.phone && (
                  <View className="flex-row items-center">
                    <Phone size={12} color="#64748b" className="mr-1" />
                    <Text className="text-slate-500 text-[10px]">{personalInfo.phone}</Text>
                  </View>
                )}
                {(personalInfo.city || personalInfo.country) && (
                  <View className="flex-row items-center">
                    <MapPin size={12} color="#64748b" className="mr-1" />
                    <Text className="text-slate-500 text-[10px]">
                      {[personalInfo.city, personalInfo.state, personalInfo.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                )}
                {personalInfo.website && (
                  <View className="flex-row items-center">
                    <Globe size={12} color="#64748b" className="mr-1" />
                    <Text className="text-slate-500 text-[10px]">{personalInfo.website}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Summary */}
            {summary ? (
              <View className="mb-6">
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-2">
                  <Sparkles size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Professional Summary</Text>
                </View>
                <Text className="text-slate-700 text-xs leading-relaxed">{summary}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {experience.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-3">
                  <Briefcase size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Work Experience</Text>
                </View>
                {experience.map((job: any, index: number) => (
                  <View key={index} className="mb-4">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-slate-800 text-xs font-bold">{job.position || 'Position'}</Text>
                      <Text className="text-slate-500 text-[10px] font-mono">{job.start_date} - {job.end_date || 'Present'}</Text>
                    </View>
                    <Text className="text-indigo-600 text-[11px] font-semibold">{job.company || 'Company'}</Text>
                    {job.description ? (
                      <Text className="text-slate-600 text-[10px] mt-1.5 leading-relaxed">{job.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Education */}
            {education.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-3">
                  <GraduationCap size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Education</Text>
                </View>
                {education.map((edu: any, index: number) => (
                  <View key={index} className="mb-3">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-slate-800 text-xs font-bold">{edu.degree || 'Degree'} in {edu.field || 'Field'}</Text>
                      <Text className="text-slate-500 text-[10px] font-mono">{edu.graduation_date}</Text>
                    </View>
                    <Text className="text-slate-600 text-[10px] font-medium">{edu.institution || 'Institution'} {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Projects */}
            {projects.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-3">
                  <FileText size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Projects</Text>
                </View>
                {projects.map((proj: any, index: number) => (
                  <View key={index} className="mb-3">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-slate-800 text-xs font-bold">{proj.title || 'Project'}</Text>
                      {proj.technologies ? (
                        <Text className="text-slate-500 text-[9px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                          {proj.technologies}
                        </Text>
                      ) : null}
                    </View>
                    {proj.role ? (
                      <Text className="text-indigo-600 text-[10px] font-semibold">{proj.role}</Text>
                    ) : null}
                    {proj.description ? (
                      <Text className="text-slate-600 text-[10px] mt-1 leading-relaxed">{proj.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Certifications */}
            {certifications.length > 0 ? (
              <View className="mb-6">
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-3">
                  <Award size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Certifications</Text>
                </View>
                {certifications.map((cert: any, index: number) => (
                  <View key={index} className="mb-2">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-slate-800 text-xs font-bold">{cert.name || 'Certification'}</Text>
                      <Text className="text-slate-500 text-[10px] font-mono">{cert.date}</Text>
                    </View>
                    <Text className="text-slate-600 text-[10px]">{cert.issuer || 'Issuer'}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Skills */}
            {skills.length > 0 ? (
              <View>
                <View className="flex-row items-center border-b border-indigo-100 pb-1 mb-3">
                  <Sparkles size={14} color="#4f46e5" className="mr-1.5" />
                  <Text className="text-indigo-600 text-xs font-bold tracking-wider uppercase">Skills</Text>
                </View>
                <View className="flex-row flex-wrap gap-1.5">
                  {skills.map((skill: string, index: number) => (
                    <View key={index} className="bg-slate-100 px-2.5 py-1.5 rounded-lg">
                      <Text className="text-slate-700 text-[10px] font-semibold">{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : resume.resume_text ? (
          /* Plain Text Upload Fallback */
          <View className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
            <View className="flex-row items-center mb-4 pb-2 border-b border-slate-700">
              <FileText size={18} color="#6366f1" className="mr-2" />
              <Text className="text-white text-base font-bold">Extracted Resume Text</Text>
            </View>
            <Text className="text-slate-300 text-xs leading-relaxed font-mono">
              {resume.resume_text}
            </Text>
          </View>
        ) : (
          /* Empty or Unparsed Fallback */
          <View className="bg-slate-800/50 border border-slate-700/30 rounded-3xl p-8 items-center mt-4">
            <FileText size={48} color="#6366f1" className="mb-4" />
            <Text className="text-white text-lg font-bold mb-2">No Content Available</Text>
            <Text className="text-slate-400 text-sm text-center">
              This resume does not contain any builder data or extracted text.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
