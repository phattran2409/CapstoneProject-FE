import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components';
import { useTheme } from '../theme';
import { useAuthStore } from '../store/authStore';

type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      login({ email, name: 'User' });
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={[styles.form, { padding: theme.spacing.l }]}>
          <Text style={[styles.title, { 
            fontSize: theme.fontSizes.header,
            color: theme.colors.text,
            fontWeight: '700',
            marginBottom: theme.spacing.xl,
          }]}>
            Login
          </Text>
          
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              marginBottom: theme.spacing.m,
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
            }]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.colors.textSecondary}
          />
          
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              marginBottom: theme.spacing.m,
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
            }]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textSecondary}
          />
          
          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: theme.spacing.m }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
  },
});

export default LoginScreen;

