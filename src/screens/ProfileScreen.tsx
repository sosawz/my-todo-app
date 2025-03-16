import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PROFILE_KEY = '@myasync_todo_profile';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random';

interface ProfileData {
  name: string;
  email: string;
  bio?: string;
  joined?: string;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme } = useThemeContext();
  
  const isDarkMode = theme === 'dark';
  
  const themeColors = {
    background: isDarkMode ? '#121212' : '#F5F5F5',
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#121212',
    subtext: isDarkMode ? '#AAAAAA' : '#666666',
    inputBg: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    border: isDarkMode ? '#3A3A3A' : '#E0E0E0',
    accent: '#4F6CFF',
    error: '#FF5252',
    placeholder: isDarkMode ? '#888888' : '#AAAAAA',
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileStr = await AsyncStorage.getItem(PROFILE_KEY);
      if (profileStr) {
        const savedProfile = JSON.parse(profileStr);
        setProfile({
          name: savedProfile.name || '',
          email: savedProfile.email || '',
          bio: savedProfile.bio || '',
          joined: savedProfile.joined || new Date().toISOString().split('T')[0]
        });
      } else {
        setProfile(prev => ({
          ...prev,
          joined: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (profile.email && !isValidEmail(profile.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setSaving(true);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile data');
    } finally {
      setSaving(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const getAvatarUrl = () => {
    if (profile.name) {
      return `${DEFAULT_AVATAR}&name=${encodeURIComponent(profile.name)}`;
    }
    return DEFAULT_AVATAR;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={[styles.loadingText, { color: themeColors.text }]}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: getAvatarUrl() }} 
              style={styles.avatar}
            />
            <Text style={[styles.avatarText, { color: themeColors.text }]}>
              {profile.name || 'ยินดีต้อนรับ'}
            </Text>
            {profile.joined && (
              <Text style={[styles.joinedText, { color: themeColors.subtext }]}>
                เข้าร่วมเมื่อ {profile.joined}
              </Text>
            )}
          </View>
          
          <View style={[styles.formCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                ชื่อ <Text style={{ color: themeColors.error }}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color={themeColors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                      color: themeColors.text 
                    }
                  ]}
                  value={profile.name}
                  onChangeText={(text) => handleChange('name', text)}
                  placeholder="กรุณาใส่ชื่อของคุณ"
                  placeholderTextColor={themeColors.placeholder}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>อีเมล</Text>
              <View style={styles.inputContainer}>
                <Icon name="email" size={20} color={themeColors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                      color: themeColors.text 
                    }
                  ]}
                  value={profile.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="กรุณาใส่อีเมลของคุณ"
                  placeholderTextColor={themeColors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>ข้อมูลเพิ่มเติม</Text>
              <View style={styles.inputContainer}>
                <Icon name="description" size={20} color={themeColors.accent} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea,
                    { 
                      backgroundColor: themeColors.inputBg,
                      borderColor: themeColors.border,
                      color: themeColors.text 
                    }
                  ]}
                  value={profile.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  placeholder="เกี่ยวกับคุณ (ไม่บังคับ)"
                  placeholderTextColor={themeColors.placeholder}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: themeColors.accent },
                saving && styles.saveButtonDisabled
              ]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinedText: {
    fontSize: 14,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});