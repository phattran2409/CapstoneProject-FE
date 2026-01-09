import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Control, Controller, FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { FootImageKey, EditProfileFormData } from "../validation/profileSchemas";

/**
 * ProfileSelectionField - Reusable selection field for profile editing
 * Supports both icon-based and image-based options
 */

// Pre-import images for both themes
const FOOT_IMAGES = {
  light: {
    left: require("@assets/icons/left.png"),
    right: require("@assets/icons/right.png"),
    both: require("@assets/icons/human-footprint.png"),
  },
  dark: {
    left: require("@assets/icons/left-dark.png"),
    right: require("@assets/icons/right-dark.png"),
    both: require("@assets/icons/human-footprint-dark.png"),
  },
} as const;

interface OptionWithIcon {
  readonly id: string;
  readonly label: string;
  readonly icon?: keyof typeof Ionicons.glyphMap;
  readonly imageKey?: FootImageKey;
}

interface ProfileSelectionFieldProps {
  control: Control<EditProfileFormData>;
  name: keyof EditProfileFormData;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: readonly OptionWithIcon[];
  error?: FieldError;
}

export function ProfileSelectionField({
  control,
  name,
  label,
  icon,
  options,
  error,
}: ProfileSelectionFieldProps) {
  const { theme, isDark } = useTheme();
  const { t } = useTranslation();

  // Helper: get image based on theme and selection state
  const getFootImage = (key: FootImageKey, isSelected: boolean) => {
    if (isDark) {
      // Dark theme: use light image when selected (for contrast with green bg)
      return isSelected ? FOOT_IMAGES.light[key] : FOOT_IMAGES.dark[key];
    }
    return FOOT_IMAGES.light[key];
  };

  // Helper to translate error message
  const getErrorMessage = (message?: string) => {
    if (!message) return "";
    return message.startsWith("validation.") ? t(message) : message;
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.fieldContainer}>
          {/* Label */}
          <View style={styles.labelContainer}>
            <Ionicons name={icon} size={16} color={theme.colors.neonGreen} />
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {label}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option) => {
              const isSelected = value === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => onChange(option.id)}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.neonGreen
                        : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.neonGreen
                        : theme.colors.border,
                    },
                  ]}
                >
                  {option.imageKey ? (
                    <Image
                      source={getFootImage(option.imageKey, isSelected)}
                      style={styles.optionImage}
                      resizeMode="contain"
                    />
                  ) : option.icon ? (
                    <Ionicons
                      name={option.icon}
                      size={16}
                      color={
                        isSelected ? theme.colors.black : theme.colors.text
                      }
                    />
                  ) : null}
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected
                          ? theme.colors.black
                          : theme.colors.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionImage: {
    width: 20,
    height: 20,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default ProfileSelectionField;

