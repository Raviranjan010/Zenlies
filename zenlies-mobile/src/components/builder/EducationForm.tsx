import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react-native';

export default function EducationForm() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });
  
  const educationEntries = watch('education') || [];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-white">Education History</Text>
        <TouchableOpacity
          onPress={() => append({ institution: '', degree: '', field: '', graduation_date: '', gpa: '', details: '' })}
          className="bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex-row items-center"
        >
          <Plus size={16} color="#818cf8" className="mr-1" />
          <Text className="text-indigo-400 text-xs font-semibold">Add Education</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field, index) => {
        const renderEntryInput = (key: string, label: string, placeholder: string) => {
          const entryValue = educationEntries[index]?.[key] || '';
          return (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">{label}</Text>
              <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor="#64748b"
                  value={entryValue}
                  onChangeText={(text) => setValue(`education.${index}.${key}`, text)}
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

            <Text className="text-white text-sm font-bold mb-4">Institution #{index + 1}</Text>

            {renderEntryInput('institution', 'INSTITUTION NAME', 'e.g. Stanford University')}
            {renderEntryInput('degree', 'DEGREE / CERTIFICATE', 'e.g. Bachelor of Science')}
            {renderEntryInput('field', 'FIELD OF STUDY', 'e.g. Computer Science')}
            {renderEntryInput('graduation_date', 'GRADUATION DATE', 'e.g. May 2024')}
            {renderEntryInput('gpa', 'GPA', 'e.g. 3.8 / 4.0')}
            {renderEntryInput('details', 'ADDITIONAL DETAILS', 'e.g. Minored in Mathematics, Honor Roll')}
          </View>
        );
      })}

      {fields.length === 0 && (
        <View className="bg-slate-800/30 border border-slate-700/20 rounded-3xl p-6 items-center">
          <Text className="text-slate-500 text-sm text-center">No education entries added yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
