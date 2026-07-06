import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react-native';

export default function ProjectForm() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'project',
  });
  
  const projectEntries = watch('project') || [];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-white">Projects</Text>
        <TouchableOpacity
          onPress={() => append({ title: '', description: '', technologies: '', link: '' })}
          className="bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex-row items-center"
        >
          <Plus size={16} color="#818cf8" className="mr-1" />
          <Text className="text-indigo-400 text-xs font-semibold">Add Project</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field, index) => {
        const renderEntryInput = (key: string, label: string, placeholder: string, multiline = false) => {
          const entryValue = projectEntries[index]?.[key] || '';
          return (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">{label}</Text>
              <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor="#64748b"
                  value={entryValue}
                  onChangeText={(text) => setValue(`project.${index}.${key}`, text)}
                  multiline={multiline}
                  style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : undefined}
                  className="text-white text-sm py-0"
                />
              </View>
            </View>
          );
        };

        return (
          <View key={field.id} className="bg-slate-800/50 border border-slate-700/30 rounded-3xl p-5 mb-5 relative">
            <TouchableOpacity
              onPress={() => remove(index)}
              className="absolute top-4 right-4 p-2 bg-red-950/40 border border-red-500/20 rounded-xl"
            >
              <Trash2 size={16} color="#f87171" />
            </TouchableOpacity>

            <Text className="text-white text-sm font-bold mb-4">Project #{index + 1}</Text>

            {renderEntryInput('title', 'PROJECT TITLE', 'e.g. Zenlies Mobile App')}
            {renderEntryInput('technologies', 'TECHNOLOGIES USED', 'e.g. React Native, TypeScript, TailwindCSS')}
            {renderEntryInput('link', 'PROJECT LINK / GITHUB URL', 'e.g. https://github.com/myproject')}
            {renderEntryInput('description', 'PROJECT DESCRIPTION', 'e.g. Built a cross-platform mobile app to scan resumes using Gemini AI, with offline caching...', true)}
          </View>
        );
      })}

      {fields.length === 0 && (
        <View className="bg-slate-800/30 border border-slate-700/20 rounded-3xl p-6 items-center">
          <Text className="text-slate-500 text-sm text-center">No projects added yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
