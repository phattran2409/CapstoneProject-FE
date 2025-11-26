import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Button, Card, Modal } from '../components';
import { useTheme } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

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
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.m }}>
        <Text
          style={{
            fontSize: theme.fontSizes.header,
            color: theme.colors.text,
            fontWeight: '700',
            marginBottom: theme.spacing.l,
          }}
        >
          {t('profile.title')}
        </Text>
        
        <Card style={{ marginBottom: theme.spacing.l }}>
          <Text style={[styles.label, {
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
            fontWeight: '400',
            marginBottom: theme.spacing.xs,
          }]}>
            {t('profile.nameLabel')}
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
            {t('profile.emailLabel')}
          </Text>
          <Text style={[styles.value, {
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '500',
          }]}>
            {user?.email || 'guest@example.com'}
          </Text>
        </Card>

        {/* Language Toggle */}
        <View style={{ marginBottom: theme.spacing.m }}>
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              fontWeight: '600',
              marginBottom: theme.spacing.s,
            }}
          >
            {t('common.language.select')}
          </Text>
          <View style={styles.languageRow}>
            {(['en', 'vi'] as const).map((lang) => {
              const isActive = language === lang;
              return (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageButton,
                    {
                      borderColor: theme.colors.primary,
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={{
                      color: isActive ? theme.colors.darkBlack : theme.colors.text,
                      fontWeight: isActive ? '600' : '500',
                    }}
                  >
                    {lang === 'en'
                      ? t('common.language.english')
                      : t('common.language.vietnamese')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {isDark ? `☀️ ${t('common.theme.light')}` : `🌙 ${t('common.theme.dark')}`}
          </Text>
        </TouchableOpacity>

        <Button
          title={t('common.buttons.showModal')}
          onPress={() => setModalVisible(true)}
          variant="secondary"
          style={{ marginBottom: theme.spacing.m }}
        />

        <Button
          title={t('common.buttons.logout')}
          onPress={handleLogout}
          variant="outline"
        />

        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title={t('profile.modalTitle')}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              fontWeight: '400',
              marginBottom: theme.spacing.l,
              lineHeight: 22,
            }}
          >
            {t('profile.modalBody')}
          </Text>
          <Button
            title={t('common.buttons.close')}
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
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default ProfileScreen;

