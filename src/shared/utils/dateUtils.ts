/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Convert a date string to a relative time string in Vietnamese
 * @param dateString - ISO date string or any valid date string
 * @returns Relative time string (e.g., "2 giờ trước", "3 ngày trước")
 *
 * @example
 * getRelativeTime("2024-01-24T10:00:00Z") // "2 giờ trước"
 * getRelativeTime("2024-01-20T10:00:00Z") // "4 ngày trước"
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInMs = now.getTime() - postDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  return postDate.toLocaleDateString("vi-VN");
};

/**
 * Format a date to a localized date string
 * @param dateString - ISO date string or any valid date string
 * @param locale - Locale string (default: 'vi-VN')
 * @returns Formatted date string
 *
 * @example
 * formatDate("2024-01-24T10:00:00Z") // "24/01/2024"
 */
export const formatDate = (
  dateString: string,
  locale: string = "vi-VN",
): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale);
};

/**
 * Format a date to a localized date and time string
 * @param dateString - ISO date string or any valid date string
 * @param locale - Locale string (default: 'vi-VN')
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime("2024-01-24T10:00:00Z") // "24/01/2024, 10:00:00"
 */
export const formatDateTime = (
  dateString: string,
  locale: string = "vi-VN",
): string => {
  const date = new Date(dateString);
  return date.toLocaleString(locale);
};

/**
 * Check if a date is today
 * @param dateString - ISO date string or any valid date string
 * @returns True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is yesterday
 * @param dateString - ISO date string or any valid date string
 * @returns True if the date is yesterday
 */
export const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export const formatDateYYYYMMDDLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDateDDMMYYYY = (yyyyMmDd: string): string => {
  const parts = yyyyMmDd.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    if (yyyy && mm && dd) return `${dd}/${mm}/${yyyy}`;
  }
  return new Date(yyyyMmDd).toLocaleDateString("vi-VN");
};  

export const getMaxSelectableDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 59, 999);
    return d;
};

export const getMinSelectableDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
};
