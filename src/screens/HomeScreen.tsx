import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../components';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
          {t('home.title')}
        </Text>
        
        <Card style={{ marginBottom: theme.spacing.l }}>
          <Text
            style={{
              fontSize: theme.fontSizes.l,
              color: theme.colors.text,
              fontWeight: '600',
              marginBottom: theme.spacing.s,
            }}
          >
            {t('home.welcomeTitle')}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: theme.colors.textSecondary,
              fontWeight: '400',
            }}
          >
            {t('home.welcomeBody')}
          </Text>
        </Card>

        <Button
          title={t('common.buttons.goToProfile')}
          onPress={() => navigation.navigate('Profile')}
          style={{ marginTop: theme.spacing.m }}
        />
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
  cardTitle: {
    fontWeight: '600',
  },
});

export default HomeScreen;

