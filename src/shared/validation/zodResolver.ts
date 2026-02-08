import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";

/**
 * Custom zodResolver that integrates with i18n
 * This allows Zod error messages to be translated
 */
export const createZodI18nResolver = <T extends z.ZodTypeAny>(schema: T) => {
  return zodResolver(schema, {
    errorMap: (issue, ctx) => {
      // Get translation function from i18n context
      // Note: This is a simplified version. In practice, you might need
      // to pass t function differently or use a context provider
      const message = ctx.defaultError;
      
      // If the message is a translation key (starts with "validation."),
      // it will be handled by the form's error display logic
      return { message };
    },
  });
};

/**
 * Helper to format Zod errors with i18n
 * Use this in your form components to display translated errors
 */
export const formatZodError = (
  error: z.ZodError,
  t: (key: string) => string
): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    const message = err.message;
    
    // Try to translate the message if it's a translation key
    formattedErrors[path] = message.startsWith("validation.")
      ? t(message)
      : message;
  });
  
  return formattedErrors;
};

