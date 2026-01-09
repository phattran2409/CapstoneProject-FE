import { z } from "zod";

/**
 * Profile validation schemas
 * Organized by feature (profile) following clean architecture
 */

// ============================================
// Field Schemas (reusable)
// ============================================

const nameField = z
  .string()
  .min(1, "validation.profile.name.required")
  .min(2, "validation.profile.name.tooShort")
  .max(50, "validation.profile.name.tooLong")
  .trim();

const bioField = z
  .string()
  .max(200, "validation.profile.bio.tooLong")
  .optional()
  .or(z.literal(""));

const phoneField = z
  .string()
  .regex(/^(0|\+84)?[0-9]{9,10}$/, "validation.profile.phone.invalid")
  .optional()
  .or(z.literal(""));

const dateOfBirthField = z
  .string()
  .optional()
  .or(z.literal(""));

const genderField = z
  .enum(["male", "female", "other"], {
    errorMap: () => ({ message: "validation.profile.gender.invalid" }),
  })
  .optional();

const positionField = z
  .string()
  .optional();

const preferredFootField = z
  .enum(["left", "right", "both"], {
    errorMap: () => ({ message: "validation.profile.preferredFoot.invalid" }),
  })
  .optional();

const shirtNumberField = z
  .union([
    z.number().int().min(1).max(99),
    z.string().regex(/^[1-9][0-9]?$/).transform(Number),
    z.literal(""),
  ])
  .optional();

// ============================================
// Form Schemas
// ============================================

/**
 * Edit Profile form schema
 */
export const editProfileSchema = z.object({
  name: nameField,
  bio: bioField,
  phone: phoneField,
  dateOfBirth: dateOfBirthField,
  gender: genderField,
  position: positionField,
  preferredFoot: preferredFootField,
  shirtNumber: shirtNumberField,
});

/**
 * Personal info section schema (subset)
 */
export const personalInfoSchema = editProfileSchema.pick({
  name: true,
  bio: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
});

/**
 * Football info section schema (subset)
 */
export const footballInfoSchema = editProfileSchema.pick({
  position: true,
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
  { id: "male", label: "Nam", icon: "male" },
  { id: "female", label: "Nữ", icon: "female" },
  { id: "other", label: "Khác", icon: "ellipse" },
] as const;

export const PREFERRED_FOOT_OPTIONS = [
  { id: "left", label: "Chân trái", imageKey: "left" },
  { id: "right", label: "Chân phải", imageKey: "right" },
  { id: "both", label: "Cả hai", imageKey: "both" },
] as const;

export type FootImageKey = "left" | "right" | "both";

