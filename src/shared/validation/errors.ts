/**
 * Centralized validation error message keys
 * These keys map to i18n translation keys for easy maintenance
 */
export const ValidationErrors = {
  // Common field errors
  required: "validation.required",
  invalid: "validation.invalid",
  
  // Email
  emailRequired: "validation.email.required",
  emailInvalid: "validation.email.invalid",
  
  // Password
  passwordRequired: "validation.password.required",
  passwordTooShort: "validation.password.tooShort",
  passwordMismatch: "validation.password.mismatch",
  passwordAlphanumeric: "validation.password.alphanumeric",
  
  // Username
  usernameRequired: "validation.username.required",
  usernameTooShort: "validation.username.tooShort",
  usernameInvalid: "validation.username.invalid",
} as const;

/**
 * Helper to get error message from i18n
 * This allows us to centralize error messages while keeping schemas clean
 */
export const getErrorMessage = (key: string, t: (key: string) => string, fallback?: string): string => {
  return t(key) || fallback || key;
};

