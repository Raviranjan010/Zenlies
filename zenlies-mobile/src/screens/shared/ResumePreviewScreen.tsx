import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList, RootStackNavigationProp } from '../../navigation/types';

export default function ResumePreviewScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ResumePreview'>>();
  const navigation = useNavigation<RootStackNavigationProp<'ResumePreview'>>();
  const resumeId = route.params?.resumeId;

  return (
    <View className="flex-1 justify-center items-center bg-slate-100 p-6">
      <Text className="text-2xl font-bold text-slate-800 mb-2">Resume Preview Screen</Text>
      <Text className="text-slate-600 mb-6 font-mono text-sm bg-white px-3 py-1 rounded border border-slate-200">
        Resume ID: {resumeId || 'None'}
      </Text>

      <TouchableOpacity 
        className="w-full max-w-xs bg-slate-800 py-3 rounded-lg"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-center font-semibold">Close / Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
