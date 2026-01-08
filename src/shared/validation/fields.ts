import { z } from "zod";

/**
 * Reusable field schemas
 * These can be composed into larger schemas using pick, omit, merge
 */

// ============================================
// Helper Functions - Reduce repetition
// ============================================

/**
 * Create a required string field with consistent error messages
 */
export const requiredString = (fieldKey: string) =>
  z
    .string({
      required_error: `validation.${fieldKey}.required`,
      invalid_type_error: `validation.${fieldKey}.invalid`,
    })
    .min(1, `validation.${fieldKey}.required`);

/**
 * Preprocess string to number (for form inputs)
 * Use when form input is string but value should be number
 */
export const stringToNumber = z.preprocess(
  (val) => (val === "" ? undefined : Number(val)),
  z.number().optional()
);

/**
 * Preprocess empty string to undefined
 * Useful for optional fields that might be empty strings from forms
 */
export const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === "" ? undefined : val), schema);

// ============================================
// Field Schemas
// ============================================

/**
 * Email field schema
 * Basic email validation - complex validation should be on backend
 */
export const emailField = z
  .string({
    required_error: "validation.email.required",
    invalid_type_error: "validation.email.invalid",
  })
  .min(1, "validation.email.required")
  .email("validation.email.invalid")
  .toLowerCase()
  .trim();

/**
 * Password field schema
 * Basic validation - complex rules (special chars, numbers) should be on backend
 */
export const passwordField = z
  .string({
    required_error: "validation.password.required",
  })
  .min(1, "validation.password.required")
  .min(8, "validation.password.tooShort");

/**
 * Username/Display name field schema
 * More permissive - allows spaces and Vietnamese characters
 */
export const usernameField = z
  .string({
    required_error: "validation.username.required",
  })
  .min(1, "validation.username.required")
  .min(2, "validation.username.tooShort")
  .max(50, "validation.username.tooLong")
  .trim();

/**
 * Optional email field (for forms where email might be optional)
 */
export const optionalEmailField = emptyStringToUndefined(
  emailField.optional()
);

/**
 * Optional password field
 */
export const optionalPasswordField = emptyStringToUndefined(
  passwordField.optional()
);

/**
 * OTP field schema
 */
export const otpField = z
  .string({
    required_error: "validation.otp.required",
  })
  .min(1, "validation.otp.required")
  .length(6, "validation.otp.invalid")
  .regex(/^\d+$/, "validation.otp.invalid");

