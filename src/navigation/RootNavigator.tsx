import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useThemeContext } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import ProjectScreen from '../screens/ProjectScreen';
import SubTaskScreen from '../screens/SubTaskScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  Project: { projectId: string; projectName: string };
  SubTask: { taskId: string };
  Stats: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';
  
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: '#4F6CFF',
      background: isDarkMode ? '#121212' : '#F5F5F5',
      card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
      text: isDarkMode ? '#FFFFFF' : '#121212',
      border: isDarkMode ? '#2C2C2C' : '#E5E5E5',
      notification: '#FF3B30',
    }
  };

  const screenOptions = {
    headerStyle: {
      backgroundColor: navigationTheme.colors.card,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: navigationTheme.colors.border,
    },
    headerTintColor: navigationTheme.colors.text,
    headerTitleStyle: {
      fontWeight: "600" as const,
      fontSize: 18,
    },
    cardStyle: { backgroundColor: navigationTheme.colors.background },
    headerBackTitleVisible: false,
  };

  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={screenOptions}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Project" 
        component={ProjectScreen}
        options={({ route }) => ({ 
          title: route.params.projectName,
          headerTitleAlign: 'center',
        })} 
      />
      <Stack.Screen 
        name="SubTask" 
        component={SubTaskScreen}
        options={{ 
          title: 'Task Detail',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ 
          title: 'Statistics',
          headerTitleAlign: 'center',
        }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'My Profile',
          headerTitleAlign: 'center',
        }} 
      />
    </Stack.Navigator>
  );
}