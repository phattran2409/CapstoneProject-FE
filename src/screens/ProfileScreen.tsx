import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Modal } from '../components';
import { useTheme } from '../theme';
import { useAuthStore } from '../store/authStore';

type RootStackParamList = {
  Profile: undefined;
  Login: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.m }}>
        <Text style={[styles.title, { 
          fontSize: theme.fontSizes.header,
          color: theme.colors.text,
          fontWeight: '700',
          marginBottom: theme.spacing.l,
        }]}>
          Profile
        </Text>
        
        <Card style={{ marginBottom: theme.spacing.l }}>
          <Text style={[styles.label, {
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
            fontWeight: '400',
            marginBottom: theme.spacing.xs,
          }]}>
            Name
          </Text>
          <Text style={[styles.value, {
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '500',
          }]}>
            {user?.name || 'Guest'}
          </Text>
          
          <Text style={[styles.label, {
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
            fontWeight: '400',
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.xs,
          }]}>
            Email
          </Text>
          <Text style={[styles.value, {
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '500',
          }]}>
            {user?.email || 'guest@example.com'}
          </Text>
        </Card>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            borderWidth: 2,
            borderColor: theme.colors.primary,
          }}
        >
          <Text style={{
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '500',
            textAlign: 'center',
          }}>
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Text>
        </TouchableOpacity>

        <Button
          title="Show Modal"
          onPress={() => setModalVisible(true)}
          variant="secondary"
          style={{ marginBottom: theme.spacing.m }}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
        />

        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Sample Modal"
        >
          <Text style={{
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '400',
            marginBottom: theme.spacing.l,
            lineHeight: 22,
          }}>
            This is a sample modal component with the new neon green theme!
          </Text>
          <Button
            title="Close"
            onPress={() => setModalVisible(false)}
            size="small"
          />
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  label: {
  },
  value: {
    fontWeight: '500',
  },
});

export default ProfileScreen;

