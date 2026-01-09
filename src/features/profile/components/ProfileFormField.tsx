import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { EditProfileFormData } from "../validation/profileSchemas";

/**
 * ProfileFormField - Reusable form field for profile editing
 * Integrates with React Hook Form and displays validation errors
 */

interface ProfileFormFieldProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  control: Control<EditProfileFormData>;
  name: keyof EditProfileFormData;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: FieldError;
  maxLength?: number;
  multiline?: boolean;
}

export function ProfileFormField({
  control,
  name,
  label,
  icon,
  error,
  maxLength,
  multiline = false,
  ...inputProps
}: ProfileFormFieldProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  // Helper to translate error message
  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.fieldContainer}>
          {/* Label */}
          <View style={styles.labelContainer}>
            <Ionicons name={icon} size={16} color={theme.colors.neonGreen} />
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {label}
            </Text>
          </View>

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: error
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.neonGreen
                  : theme.colors.border,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  height: multiline ? 100 : 48,
                  textAlignVertical: multiline ? "top" : "center",
                },
              ]}
              value={value?.toString() ?? ""}
              onChangeText={onChange}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              onFocus={() => setIsFocused(true)}
              placeholderTextColor={theme.colors.textSecondary}
              multiline={multiline}
              maxLength={maxLength}
              {...inputProps}
            />
            {maxLength && (
              <Text
                style={[styles.charCount, { color: theme.colors.textSecondary }]}
              >
                {(value?.toString() ?? "").length}/{maxLength}
              </Text>
            )}
          </View>

          {/* Error */}
          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {getErrorMessage(error.message)}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
  },
  charCount: {
    position: "absolute",
    right: 12,
    bottom: 12,
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ProfileFormField;

