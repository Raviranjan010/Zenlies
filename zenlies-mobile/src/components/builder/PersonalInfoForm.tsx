import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useFormContext } from 'react-hook-form';

export default function PersonalInfoForm() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const renderInput = (name: string, label: string, placeholder: string, keyboardType: any = 'default', autoCapitalize: any = 'none') => {
    const value = watch(name) || '';
    return (
      <View className="mb-4">
        <Text className="text-slate-400 text-xs font-semibold mb-2 ml-1">{label}</Text>
        <View className="bg-slate-900/60 border border-slate-700 rounded-2xl px-4 py-3">
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#64748b"
            value={value}
            onChangeText={(text) => setValue(name, text)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            className="text-white text-sm py-0"
          />
        </View>
        {errors[name] && (
          <Text className="text-red-400 text-xs mt-1 ml-1">{(errors[name]?.message as string) || 'Invalid input'}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
      <Text className="text-xl font-bold text-white mb-6">Personal Information</Text>
      
      {renderInput('personal_info.full_name', 'FULL NAME *', 'John Doe', 'default', 'words')}
      {renderInput('personal_info.professional_title', 'PROFESSIONAL TITLE *', 'Software Engineer', 'default', 'words')}
      {renderInput('personal_info.email', 'EMAIL ADDRESS *', 'john.doe@example.com', 'email-address')}
      {renderInput('personal_info.phone', 'PHONE NUMBER', '+1 (234) 567-8900', 'phone-pad')}
      {renderInput('personal_info.address', 'STREET ADDRESS', '123 Main St')}
      
      <View className="flex-row justify-between">
        <View className="flex-1 mr-2">
          {renderInput('personal_info.city', 'CITY', 'New York', 'default', 'words')}
        </View>
        <View className="flex-1 ml-2">
          {renderInput('personal_info.state', 'STATE', 'NY', 'default', 'words')}
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="flex-1 mr-2">
          {renderInput('personal_info.country', 'COUNTRY', 'USA', 'default', 'words')}
        </View>
        <View className="flex-1 ml-2">
          {renderInput('personal_info.zip', 'ZIP CODE', '10001', 'number-pad')}
        </View>
      </View>

      {renderInput('personal_info.linkedin', 'LINKEDIN URL', 'https://linkedin.com/in/johndoe')}
      {renderInput('personal_info.github', 'GITHUB URL', 'https://github.com/johndoe')}
      {renderInput('personal_info.website', 'PORTFOLIO WEBSITE', 'https://johndoe.com')}
    </ScrollView>
  );
}
