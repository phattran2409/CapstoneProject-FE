import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

/**
 * FormField - Reusable form field component with React Hook Form integration
 * Handles error display with i18n translation
 */

interface FormFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showPasswordToggle?: boolean;
  containerStyle?: ViewStyle;
}

export function FormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  icon,
  showPasswordToggle,
  containerStyle,
  secureTextEntry,
  ...inputProps
}: FormFieldProps<TFieldValues>) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.container, containerStyle]}>
          {label && (
            <Text style={[styles.label, { color: theme.colors.softWhite }]}>
              {label}
            </Text>
          )}
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: error ? theme.colors.error : "#3b3b3b",
              },
            ]}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={error ? theme.colors.error : theme.colors.textSecondary}
              />
            )}
            <TextInput
              style={[
                styles.input,
                showPasswordToggle && styles.inputWithToggle,
                { color: theme.colors.softWhite },
              ]}
              placeholderTextColor={theme.colors.textSecondary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              {...inputProps}
            />
            {showPasswordToggle && (
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
          {error?.message && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error.message.startsWith("validation.")
                ? t(error.message)
                : error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormField;

