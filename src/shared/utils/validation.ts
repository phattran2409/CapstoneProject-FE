// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 8 characters)
export const isValidPassword = (password: string): boolean => {
  return !!password && password.length >= 8;
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
};

// Name validation
export const isValidName = (name: string): boolean => {
  return !!name && name.trim().length >= 2;
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Content validation (for posts/comments)
export const validateContent = (
  content: string,
  maxLength: number = 5000,
): { isValid: boolean; errorKey?: string } => {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return { isValid: false, errorKey: "actionButton.validation.required" };
  }

  if (trimmedContent.length > maxLength) {
    return { isValid: false, errorKey: "actionButton.validation.tooLong" };
  }

  return { isValid: true };
};
