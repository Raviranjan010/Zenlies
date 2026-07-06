import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { Plus, X } from 'lucide-react-native';

export default function SkillForm() {
  const { setValue, watch } = useFormContext();
  const [skillInput, setSkillInput] = useState('');
  
  const skills: string[] = watch('skills') || [];

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setValue('skills', [...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setValue('skills', skills.filter((s) => s !== skill));
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <Text className="text-xl font-bold text-white mb-6">Skills</Text>
      <Text className="text-slate-400 text-xs mb-4">Add your technical skills, tools, frameworks, and soft skills.</Text>
      
      {/* Tag Input */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3 mr-3">
          <TextInput
            placeholder="e.g. React Native, Python, Leadership"
            placeholderTextColor="#64748b"
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={handleAddSkill}
            className="text-white text-sm py-0"
          />
        </View>
        <TouchableOpacity
          onPress={handleAddSkill}
          className="bg-indigo-600 w-12 h-12 rounded-2xl justify-center items-center"
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Chip list */}
      <View className="flex-row flex-wrap gap-2">
        {skills.map((skill, index) => (
          <View key={index} className="flex-row items-center bg-indigo-950/40 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            <Text className="text-indigo-400 text-xs font-semibold mr-1.5">{skill}</Text>
            <TouchableOpacity onPress={() => handleRemoveSkill(skill)} className="p-0.5">
              <X size={12} color="#818cf8" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {skills.length === 0 && (
        <View className="bg-slate-800/30 border border-slate-700/20 rounded-3xl p-6 items-center mt-4">
          <Text className="text-slate-500 text-sm text-center">No skills added yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
