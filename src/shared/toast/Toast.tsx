/**
 * Toast Component
 * Custom Toast component với styling phù hợp với theme của app
 */

import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useTheme } from '@/shared/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

/**
 * Custom Toast component với theme support
 */
export const AppToast: React.FC = () => {
  const { theme } = useTheme();

  /**
   * Custom Success Toast
   */
  const successToast = ({ text1, text2, ...props }: any) => (
    <BaseToast
      {...props}
      text1NumberOfLines={3}
      text2NumberOfLines={12}
      style={{
        borderLeftColor: theme.colors.success,
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 4,
        height: 'auto',
        minHeight: 60,
        paddingVertical: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      text1Style={{
        fontSize: theme.fontSizes.m,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
      }}
      text2Style={{
        fontSize: theme.fontSizes.s,
        color: theme.colors.textSecondary,
        marginTop: 4,
      }}
      text1={text1}
      text2={text2}
      renderLeadingIcon={() => (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={theme.colors.success}
          style={{ marginLeft: 16, marginRight: 8 }}
        />
      )}
    />
  );

  /**
   * Custom Error Toast
   */
  const errorToast = ({ text1, text2, ...props }: any) => (
    <ErrorToast
      {...props}
      text1NumberOfLines={3}
      text2NumberOfLines={12}
      style={{
        borderLeftColor: theme.colors.error,
        backgroundColor: "#FF5252",
        borderLeftWidth: 4,
        height: 'auto',
        minHeight: 60,
        paddingVertical: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      text1Style={{
        fontSize: theme.fontSizes.m,
        fontWeight: theme.fontWeights.semiBold,
        color: "#FFFFFF",
      }}
      text2Style={{
        fontSize: theme.fontSizes.s,
        color: "#FFFFFF",
        marginTop: 4,
      }}
      text1={text1}
      text2={text2}
      renderLeadingIcon={() => (
        <View style={{ display: "flex", alignItems: "center", justifyContent: "center"}}>
          <Ionicons
            name="close-circle"
            size={50}
            color={"#FFFFFF"}
            style={{ marginTop: 4 , marginLeft: 16, marginRight: 8}}
          />
        </View>
      )}
    />
  );

  /**
   * Custom Info Toast
   */
  const infoToast = ({ text1, text2, ...props }: any) => (
    <BaseToast
      {...props}
      text1NumberOfLines={3}
      text2NumberOfLines={12}
      style={{
        borderLeftColor: theme.colors.info,
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 4,
        height: 'auto',
        minHeight: 60,
        paddingVertical: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      text1Style={{
        fontSize: theme.fontSizes.m,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
      }}
      text2Style={{
        fontSize: theme.fontSizes.s,
        color: theme.colors.textSecondary,
        marginTop: 4,
      }}
      text1={text1}
      text2={text2}
      renderLeadingIcon={() => (
        <Ionicons
          name="information-circle"
          size={24}
          color={theme.colors.info}
          style={{ marginLeft: 16, marginRight: 8 }}
        />
      )}
    />
  );

  /**
   * Custom Warning Toast
   */
  const warningToast = ({ text1, text2, ...props }: any) => (
    <BaseToast
      {...props}
      text1NumberOfLines={3}
      text2NumberOfLines={12}
      style={{
        borderLeftColor: theme.colors.warning,
        backgroundColor: theme.colors.surface,
        borderLeftWidth: 4,
        height: 'auto',
        minHeight: 60,
        paddingVertical: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
      text1Style={{
        fontSize: theme.fontSizes.m,
        fontWeight: theme.fontWeights.semiBold,
        color: theme.colors.text,
      }}
      text2Style={{
        fontSize: theme.fontSizes.s,
        color: theme.colors.textSecondary,
        marginTop: 4,
      }}
      text1={text1}
      text2={text2}
      renderLeadingIcon={() => (
        <Ionicons
          name="warning"
          size={24}
          color={theme.colors.warning}
          style={{ marginLeft: 16, marginRight: 8 }}
        />
      )}
    />
  );

  const toastConfig = {
    success: successToast,
    error: errorToast,
    info: infoToast,
    warning: warningToast,
  };

  return <Toast config={toastConfig} />;
};

