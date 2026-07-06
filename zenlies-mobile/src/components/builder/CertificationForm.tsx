import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react-native';

export default function CertificationForm() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certification',
  });
  
  const certificationEntries = watch('certification') || [];

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-white">Certifications</Text>
        <TouchableOpacity
          onPress={() => append({ name: '', issuer: '', issue_date: '', expiration_date: '', link: '' })}
          className="bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex-row items-center"
        >
          <Plus size={16} color="#818cf8" className="mr-1" />
          <Text className="text-indigo-400 text-xs font-semibold">Add Certificate</Text>
        </TouchableOpacity>
      </View>

      {fields.map((field, index) => {
        const renderEntryInput = (key: string, label: string, placeholder: string) => {
          const entryValue = certificationEntries[index]?.[key] || '';
          return (
            <View className="mb-4">
              <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">{label}</Text>
              <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
                <TextInput
                  placeholder={placeholder}
                  placeholderTextColor="#64748b"
                  value={entryValue}
                  onChangeText={(text) => setValue(`certification.${index}.${key}`, text)}
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

            <Text className="text-white text-sm font-bold mb-4">Certificate #{index + 1}</Text>

            {renderEntryInput('name', 'CERTIFICATION NAME', 'e.g. AWS Certified Solutions Architect')}
            {renderEntryInput('issuer', 'ISSUING ORGANIZATION', 'e.g. Amazon Web Services')}
            {renderEntryInput('issue_date', 'ISSUE DATE', 'e.g. Dec 2023')}
            {renderEntryInput('expiration_date', 'EXPIRATION DATE (OPTIONAL)', 'e.g. Dec 2026')}
            {renderEntryInput('link', 'VERIFICATION LINK / CREDENTIAL URL', 'e.g. https://credly.com/...')}
          </View>
        );
      })}

      {fields.length === 0 && (
        <View className="bg-slate-800/30 border border-slate-700/20 rounded-3xl p-6 items-center">
          <Text className="text-slate-500 text-sm text-center">No certifications added yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}
