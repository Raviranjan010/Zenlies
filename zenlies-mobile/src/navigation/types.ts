import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Parameters for Bottom Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Builder: undefined;
  Profile: undefined;
};

// Parameters for Root Stack Navigator
export type RootStackParamList = {
  // Unauthenticated flow
  Login: undefined;
  Register: undefined;
  Otp: { email: string };

  // Authenticated flow
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ResumePreview: { resumeId?: string } | undefined;
};

// Navigation props for convenience in screens
export type RootStackNavigationProp<T extends keyof RootStackParamList> = 
  NativeStackNavigationProp<RootStackParamList, T>;

export type MainTabNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;
