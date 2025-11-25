import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../components';
import { useTheme } from '../theme';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.m }}>
        <Text style={[styles.title, { 
          fontSize: theme.fontSizes.header,
          color: theme.colors.text,
          fontWeight: '700',
          marginBottom: theme.spacing.l,
        }]}>
          Home Screen
        </Text>
        
        <Card style={{ marginBottom: theme.spacing.l }}>
          <Text style={[styles.cardTitle, { 
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: '600',
            marginBottom: theme.spacing.s,
          }]}>
            Welcome to your app!
          </Text>
          <Text style={{ 
            fontSize: theme.fontSizes.m,
            color: theme.colors.textSecondary,
            fontWeight: '400',
          }}>
            This is a sample home screen with a card component styled with neon green theme.
          </Text>
        </Card>

        <Button
          title="Go to Profile"
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

