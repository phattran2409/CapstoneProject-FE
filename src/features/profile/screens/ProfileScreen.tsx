import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import { useAuthStore, useLogout } from '@/features/auth';
import { useMyProfile } from '@/features/profile/hooks';
import { useAppStore } from '@/store/appStore';
import { RootStackParamList, TabParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';

type ProfileScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);

  // ✅ Fetch user profile from API
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  
  // ✅ Use logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const scrollHandler = useScrollToHideTabBar();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('Login');
        }
      },
    });
  };

  const handleAvatarPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('PersonalPage');
    }
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={{ padding: theme.spacing.m }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Header: title + chat icon */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.l,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.xxl,
              color: theme.colors.text,
              fontWeight: '700',
            }}
          >
            {t('profile.title')}
          </Text>     
        </View>      
        {/* Compact Profile Section - rectangular card leading to personal page */}
        <TouchableOpacity
          onPress={handleAvatarPress}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderRadius: theme.radius.l,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            marginBottom: theme.spacing.l,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#E8D5C4',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: theme.colors.neonGreen,
              marginRight: theme.spacing.m,
            }}
          >
            <Ionicons name="person" size={36} color={theme.colors.textSecondary} />
          </View>

          {/* Name + info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: theme.fontSizes.m,
                color: theme.colors.text,
                fontWeight: '700',
                marginBottom: theme.spacing.xs / 2,
              }}
            >
              {user?.name || 'Tuấn Anh Nguyễn'}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSizes.s,
                color: theme.colors.textSecondary,
              }}
              numberOfLines={1}
            >
              {t('profile.position')}: {t('profile.forward')} · {t('profile.matchesCount', { count: 25 })}
            </Text>
          </View>

          {/* Arrow icon to indicate go to personal page */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={{ marginBottom: theme.spacing.l }}>
          <Text
            style={{
              fontSize: theme.fontSizes.s,
              color: theme.colors.textSecondary,
              fontWeight: '600',
              marginBottom: theme.spacing.m,
              textTransform: 'uppercase',
            }}
          >
            {t('profile.account')}
          </Text>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
            onPress={handleAvatarPress}
          >
            <Ionicons name="person-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.editPersonalInfo')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.changePassword')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="share-social-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.linkSocialAccounts')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={{ marginBottom: theme.spacing.l }}>
          <Text
            style={{
              fontSize: theme.fontSizes.s,
              color: theme.colors.textSecondary,
              fontWeight: '600',
              marginBottom: theme.spacing.m,
              textTransform: 'uppercase',
            }}
          >
            {t('profile.notifications')}
          </Text>
          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.matchInvitations')}
            </Text>
            <Switch
              value={matchNotifications}
              onValueChange={setMatchNotifications}
              trackColor={{ false: theme.colors.border, true: theme.colors.neonGreen }}
              thumbColor={theme.colors.white}
            />
          </View>
        
        </View>

        {/* Application Section */}
        <View style={{ marginBottom: theme.spacing.l }}>
          <Text
            style={{
              fontSize: theme.fontSizes.s,
              color: theme.colors.textSecondary,
              fontWeight: '600',
              marginBottom: theme.spacing.m,
              textTransform: 'uppercase',
            }}
          >
            {t('profile.application')}
          </Text>
            <TouchableOpacity
            onPress={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            style={[
              styles.settingItem,
              {
              backgroundColor: theme.colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              paddingVertical: theme.spacing.m,
              paddingHorizontal: theme.spacing.m,
              borderRadius: theme.radius.m,
              marginBottom: theme.spacing.xs,
              },
            ]}
            >
            <Ionicons name="globe-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.language')}
            </Text>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary, fontSize: theme.fontSizes.s }]}>
              {language === 'vi' ? t('common.language.vietnamese') : t('common.language.english')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="moon-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.interface')}
            </Text>
           
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.neonGreen }}
              thumbColor={theme.colors.white}
            />            
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="shield-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.privacyPolicy')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: theme.colors.surface,
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.m,
                borderRadius: theme.radius.m,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text, fontSize: theme.fontSizes.m, marginLeft: theme.spacing.m }]}>
              {t('profile.termsOfService')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>


        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.neonGreen,
              shadowColor: theme.colors.neonGreen,
              borderRadius: theme.radius.l,
              paddingVertical: theme.spacing.m,
              marginTop: theme.spacing.m,
            },
          ]}
          onPress={handleLogout}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            style={{ color: theme.colors.background, textAlign: 'center' }}
          >
            {t('common.buttons.logout')}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontWeight: '500',
  },
  settingValue: {
    marginRight: 4,
  },
  logoutButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ProfileScreen;

