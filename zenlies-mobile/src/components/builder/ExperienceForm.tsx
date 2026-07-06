import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react-native';

export default function ExperienceForm() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });
  
  const experienceEntries = watch('experience') || [];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-white">Work Experience</Text>
        <TouchableOpacity
          onPress={() => append({ company: '', position: '', start_date: '', end_date: '', is_current: false, description: '' })}
          className="bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex-row items-center"
        >
          <Plus size={16} color="#818cf8" className="mr-1" />
          <Text className="text-indigo-400 text-xs font-semibold">Add Experience</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field, index) => {
        const isCurrent = experienceEntries[index]?.is_current || false;
        
        const renderEntryInput = (key: string, label: string, placeholder: string, multiline = false) => {
          const entryValue = experienceEntries[index]?.[key] || '';
          return (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">{label}</Text>
              <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor="#64748b"
                  value={entryValue}
                  onChangeText={(text) => setValue(`experience.${index}.${key}`, text)}
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

            <Text className="text-white text-sm font-bold mb-4">Job #{index + 1}</Text>

            {renderEntryInput('company', 'COMPANY NAME', 'e.g. Google')}
            {renderEntryInput('position', 'JOB TITLE', 'e.g. Senior Software Engineer')}
            {renderEntryInput('start_date', 'START DATE', 'e.g. Jan 2022')}

            {/* Is Current toggle */}
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-slate-400 text-xs font-semibold">I CURRENTLY WORK HERE</Text>
              <Switch
                value={isCurrent}
                onValueChange={(val) => {
                  setValue(`experience.${index}.is_current`, val);
                  if (val) {
                    setValue(`experience.${index}.end_date`, 'Present');
                  } else if (experienceEntries[index]?.end_date === 'Present') {
                    setValue(`experience.${index}.end_date`, '');
                  }
                }}
                trackColor={{ false: '#334155', true: '#4f46e5' }}
                thumbColor={isCurrent ? '#818cf8' : '#64748b'}
              />
            </View>

            {!isCurrent && renderEntryInput('end_date', 'END DATE', 'e.g. Present, Dec 2023')}
            {renderEntryInput('description', 'DESCRIPTION / KEY IMPACTS', 'e.g. Managed a team of 4 engineers, designed database schemas, migrated legacy systems...', true)}
          </View>
        );
      })}

      {fields.length === 0 && (
        <View className="bg-slate-800/30 border border-slate-700/20 rounded-3xl p-6 items-center">
          <Text className="text-slate-500 text-sm text-center">No experience entries added yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
