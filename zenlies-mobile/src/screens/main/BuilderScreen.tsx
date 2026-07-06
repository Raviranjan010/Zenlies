import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, FormProvider } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { SlideInRight, SlideOutLeft, SlideInLeft, SlideOutRight } from 'react-native-reanimated';

// Forms
import PersonalInfoForm from '../../components/builder/PersonalInfoForm';
import EducationForm from '../../components/builder/EducationForm';
import ExperienceForm from '../../components/builder/ExperienceForm';
import SkillForm from '../../components/builder/SkillForm';
import ProjectForm from '../../components/builder/ProjectForm';
import CertificationForm from '../../components/builder/CertificationForm';
import ProfessionalSummaryForm from '../../components/builder/ProfessionalSummaryForm';
import PreviewStep from '../../components/builder/PreviewStep';

const STEPS = [
  { title: 'Personal Info' },
  { title: 'Education' },
  { title: 'Experience' },
  { title: 'Skills' },
  { title: 'Projects' },
  { title: 'Certifications' },
  { title: 'Summary' },
  { title: 'Review' },
];

export default function BuilderScreen() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'back'>('next');

  const methods = useForm({
    defaultValues: {
      title: '',
      personal_info: {
        full_name: '',
        professional_title: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        linkedin: '',
        github: '',
        website: '',
      },
      education: [],
      experience: [],
      skills: [],
      project: [],
      certification: [],
      professional_summary: '',
      ats_score: 0,
    },
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setDirection('next');
      // Timeout is used to batch state updates cleanly on screen transition
      setTimeout(() => {
        setStep((s) => s + 1);
      }, 50);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection('back');
      setTimeout(() => {
        setStep((s) => s - 1);
      }, 50);
    }
  };

  const renderStepComponent = () => {
    switch (step) {
      case 0:
        return <PersonalInfoForm />;
      case 1:
        return <EducationForm />;
      case 2:
        return <ExperienceForm />;
      case 3:
        return <SkillForm />;
      case 4:
        return <ProjectForm />;
      case 5:
        return <CertificationForm />;
      case 6:
        return <ProfessionalSummaryForm />;
      case 7:
        return <PreviewStep />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <FormProvider {...methods}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-slate-900"
      >
        <View className="flex-1 px-6 pt-6">
          {/* Horizontal Step Indicator Header */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3 px-1">
              {STEPS.map((_, idx) => (
                <View key={idx} className="flex-row items-center">
                  <View
                    className={`w-7 h-7 rounded-full justify-center items-center border ${
                      idx === step
                        ? 'bg-indigo-600 border-indigo-400'
                        : idx < step
                          ? 'bg-indigo-950 border-indigo-800'
                          : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${idx <= step ? 'text-white' : 'text-slate-500'}`}>
                      {idx + 1}
                    </Text>
                  </View>
                  {idx < STEPS.length - 1 && (
                    <View className={`h-[1px] w-[11px] ${idx < step ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                  )}
                </View>
              ))}
            </View>

            {/* Current Step Label */}
            <View className="bg-slate-800/40 border border-slate-700/30 rounded-2xl py-2 px-4 flex-row justify-between items-center">
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Step {step + 1} of {STEPS.length}
              </Text>
              <Text className="text-white text-xs font-extrabold uppercase">
                {STEPS[step].title}
              </Text>
            </View>
          </View>

          {/* Form Step Workspace */}
          <View className="flex-1 mb-6">
            <Animated.View
              key={step}
              entering={direction === 'next' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
              exiting={direction === 'next' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)}
              className="flex-1"
            >
              {renderStepComponent()}
            </Animated.View>
          </View>

          {/* Navigation Controls footer (omit on final review step) */}
          {step < STEPS.length - 1 && (
            <View className="flex-row justify-between pb-6">
              {/* Back Button */}
              {step > 0 ? (
                <TouchableOpacity
                  onPress={handleBack}
                  className="flex-1 bg-slate-800 border border-slate-700 py-4 rounded-2xl mr-2 flex-row justify-center items-center"
                >
                  <ChevronLeft size={18} color="#94a3b8" className="mr-1" />
                  <Text className="text-slate-300 text-base font-semibold">Back</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-1 mr-2" />
              )}

              {/* Next Button */}
              <TouchableOpacity onPress={handleNext} className="flex-1 ml-2">
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-indigo-500/20"
                >
                  <Text className="text-white text-base font-semibold mr-1">Next</Text>
                  <ChevronRight size={18} color="#ffffff" className="ml-1" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </FormProvider>
  );
}
