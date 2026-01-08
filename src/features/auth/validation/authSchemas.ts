import { z } from "zod";
import {
  emailField,
  passwordField,
  usernameField,
  otpField,
} from "@/shared/validation/fields";

/**
 * Auth validation schemas
 * Organized by feature (auth) following clean architecture
 * 
 * Principles:
 * - Basic validation on frontend, complex logic on backend
 * - Use superRefine only for cross-field validation
 * - Reuse schemas with pick, omit, merge
 * - Infer TypeScript types from schemas
 */

// ============================================
// Base Schemas
// ============================================

/**
 * Login form schema
 * Simple email + password validation
 */
export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

/**
 * Base registration fields (without confirmPassword)
 */
const baseRegisterFields = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
});

/**
 * Register form schema
 * Uses superRefine for cross-field validation (password matching)
 */
export const registerSchema = baseRegisterFields
  .extend({
    confirmPassword: z.string().min(1, "validation.password.required"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.password.mismatch",
        path: ["confirmPassword"],
      });
    }
  });

/**
 * OTP verification schema
 */
export const otpSchema = z.object({
  email: emailField,
  otp: otpField,
});

// ============================================
// API Request Schemas (derived from form schemas)
// ============================================

/**
 * Register request schema (for API)
 * Uses base fields without confirmPassword
 */
export const registerRequestSchema = baseRegisterFields.transform((data) => ({
  name: data.username,
  email: data.email,
  password: data.password,
}));

/**
 * Login request schema (same as form schema)
 */
export const loginRequestSchema = loginSchema;

// ============================================
// TypeScript Types (inferred from schemas)
// ============================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;

