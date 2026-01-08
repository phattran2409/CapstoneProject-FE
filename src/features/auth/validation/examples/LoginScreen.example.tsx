/**
 * Example: LoginScreen with React Hook Form + Zod validation
 * 
 * This is an example implementation showing how to integrate
 * Zod schemas with React Hook Form in a React Native component.
 */

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Text, TextInput, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { loginSchema, type LoginFormData } from "../authSchemas";
import { useLogin } from "../../hooks/useLogin";

export const LoginScreenExample: React.FC = () => {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // Data is type-safe and validated
    login(
      { email: data.email, password: data.password },
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

      <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending}>
        <Text>{t("common.buttons.login")}</Text>
      </TouchableOpacity>
    </View>
  );
};

