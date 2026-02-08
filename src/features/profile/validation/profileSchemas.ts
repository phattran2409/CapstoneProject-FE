import { z } from "zod";

/**
 * Profile validation schemas
 * Organized by feature (profile) following clean architecture
 * Matches backend FluentValidation rules
 */

// ============================================
// Field Schemas (reusable)
// ============================================

// FullName: optional, max 255 characters
const fullNameField = z
  .string()
  .max(255, "validation.profile.name.tooLong")
  .trim()
  .optional()
  .or(z.literal(""));

// Bio: optional, max 500 characters
const bioField = z
  .string()
  .max(500, "validation.profile.bio.tooLong")
  .optional()
  .or(z.literal(""));

// Phone: optional, E.164 format (^\+?[1-9]\d{1,14}$)
const phoneField = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "validation.profile.phone.invalid")
  .optional()
  .or(z.literal(""));

// AvatarUrl: optional, must be valid HTTP/HTTPS URL
const avatarUrlField = z
  .string()
  .url("validation.profile.avatarUrl.invalid")
  .refine(
    (url) => {
      if (!url) return true;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "validation.profile.avatarUrl.invalid" },
  )
  .optional()
  .or(z.literal(""));

// DateOfBirth: optional, must be in the past and not more than 120 years ago
const dateOfBirthField = z
  .string()
  .refine(
    (date) => {
      if (!date) return true;
      const dateObj = new Date(date);
      const now = new Date();
      const minDate = new Date();
      minDate.setFullYear(now.getFullYear() - 120);
      return dateObj < now && dateObj > minDate;
    },
    { message: "validation.profile.dateOfBirth.invalid" },
  )
  .optional()
  .or(z.literal(""));

// Gender: optional, must be valid enum value (0 = Male, 1 = Female, 2 = Other)
const genderField = z
  .number()
  .int()
  .refine((val) => val >= 0 && val <= 2, {
    message: "validation.profile.gender.invalid",
  })
  .optional()
  .or(z.literal("").transform(() => undefined));

// Position: optional
const positionField = z.string().optional().or(z.literal(""));

// PreferredFoot: optional
const preferredFootField = z.string().optional().or(z.literal(""));

// ShirtNumber: optional, 1-99 (realistic jersey numbers)
const shirtNumberField = z
  .union([
    z.number().int().min(1).max(99),
    z
      .string()
      .regex(/^[1-9][0-9]?$/)
      .transform(Number),
  ])
  .optional();

// ============================================
// Form Schemas
// ============================================

/**
 * Edit Profile form schema
 * All fields are optional to match backend validation
 */
export const editProfileSchema = z.object({
  fullName: fullNameField,
  bio: bioField,
  phone: phoneField,
  dateOfBirth: dateOfBirthField,
  gender: genderField,
  preferredPositions: positionField,
  preferredFoot: preferredFootField,
  shirtNumber: shirtNumberField,
  avatarUrl: avatarUrlField,
});

/**
 * Personal info section schema (subset)
 */
export const personalInfoSchema = editProfileSchema.pick({
  fullName: true,
  bio: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
});

/**
 * Football info section schema (subset)
 */
export const footballInfoSchema = editProfileSchema.pick({
  preferredPositions: true,
  preferredFoot: true,
  shirtNumber: true,
});

// ============================================
// TypeScript Types (inferred from schemas)
// ============================================

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type FootballInfoFormData = z.infer<typeof footballInfoSchema>;

// ============================================
// Constants for form options
// ============================================

export const POSITIONS = [
  { id: "GK", label: "GK" },
  { id: "CB", label: "CB" },
  { id: "LB", label: "LB" },
  { id: "RB", label: "RB" },
  { id: "CDM", label: "CDM" },
  { id: "CM", label: "CM" },
  { id: "CAM", label: "CAM" },
  { id: "LW", label: "LW" },
  { id: "RW", label: "RW" },
  { id: "ST", label: "ST" },
] as const;

export const GENDERS = [
  { id: 0, label: "Nam", icon: "male" },
  { id: 1, label: "Nữ", icon: "female" },
  { id: 2, label: "Khác", icon: "ellipse" },
] as const;

export const PREFERRED_FOOT_OPTIONS = [
  { id: "left", label: "Chân trái", imageKey: "left" },
  { id: "right", label: "Chân phải", imageKey: "right" },
  { id: "both", label: "Cả hai", imageKey: "both" },
] as const;

export type FootImageKey = "left" | "right" | "both";
