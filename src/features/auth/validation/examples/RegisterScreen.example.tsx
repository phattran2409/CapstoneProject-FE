/**
 * Example: RegisterScreen with React Hook Form + Zod validation
 * 
 * This example shows:
 * - Using registerSchema with cross-field validation (password matching)
 * - Handling nested errors from superRefine
 * - Type-safe form data
 */

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import {
  registerSchema,
  type RegisterFormData,
  registerRequestSchema,
} from "../authSchemas";
import { useRegister } from "../../hooks/useRegister";

export const RegisterScreenExample: React.FC = () => {
  const { t } = useTranslation();
  const { mutate: register, isPending } = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // Transform to API request format (omit confirmPassword)
    const requestData = registerRequestSchema.parse(data);
    register(
      { fullName: requestData.name, email: requestData.email, password: requestData.password },
      {
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        // Handle error
        console.error(error);
      },
    }
    );
  };

  return (
    <View>
      {/* Username Field */}
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder={t("register.usernamePlaceholder")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={{ color: "red" }}>
                {t(errors.username.message || "validation.username.required")}
              </Text>
            )}
          </View>
        )}
      />

      {/* Email Field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder={t("login.emailPlaceholder")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={{ color: "red" }}>
                {t(errors.email.message || "validation.email.invalid")}
              </Text>
            )}
          </View>
        )}
      />

      {/* Password Field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder={t("login.passwordPlaceholder")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
            />
            {errors.password && (
              <Text style={{ color: "red" }}>
                {t(errors.password.message || "validation.password.required")}
              </Text>
            )}
          </View>
        )}
      />

      {/* Confirm Password Field */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              placeholder={t("register.confirmPasswordPlaceholder")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={{ color: "red" }}>
                {t(
                  errors.confirmPassword.message ||
                    "validation.password.mismatch"
                )}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending}>
        <Text>{t("common.buttons.register")}</Text>
      </TouchableOpacity>
    </View>
  );
};

