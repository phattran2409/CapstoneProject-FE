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

/**
 * Backend (FluentValidation): ^\+?[1-9]\d{1,14}$
 * — Không được bắt đầu bằng 0 sau dấu + tùy chọn (035… bị reject).
 */
const BACKEND_PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

const stripPhoneSeparators = (value: string) =>
  value.trim().replace(/[\s.-]/g, "");

/**
 * Chuẩn hóa di động VN → dạng API: 8435… (không 0 đầu), khớp BACKEND_PHONE_REGEX.
 * Nhận: 035…, +84…, 0084…, hoặc đã là 843…
 */
export function normalizeToBackendPhone(raw: string): string {
  let s = stripPhoneSeparators(raw);
  if (!s) return "";
  if (s.startsWith("0084")) {
    s = s.slice(2);
  } else if (s.startsWith("+84")) {
    s = s.slice(1);
  } else if (/^0(?:3|5|7|8|9)\d{8}$/.test(s)) {
    s = `84${s.slice(1)}`;
  }
  return s;
}

/**
 * Sau khi normalize, chỉ chấp nhận di động VN (84 + đầu 3|5|7|8|9 + 8 số),
 * đồng thời khớp rule BE ^\+?[1-9]\d{1,14}$ (không dùng + trong output).
 */
const VN_MOBILE_NORMALIZED_REGEX = /^84(?:3|5|7|8|9)\d{8}$/;

// Phone: optional; chuẩn hóa rồi kiểm tra khớp BE + định dạng di động VN
const phoneField = z
  .string()
  .transform((val) => normalizeToBackendPhone(val))
  .refine(
    (s) =>
      s === "" ||
      (BACKEND_PHONE_REGEX.test(s) && VN_MOBILE_NORMALIZED_REGEX.test(s)),
    { message: "validation.profile.phone.invalid" },
  );

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
  { id: "FW", label: "FW" },
  { id: "DF", label: "DF" },
  { id: "CF", label: "CF" },
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
