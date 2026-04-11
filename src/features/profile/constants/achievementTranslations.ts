/**
 * Frontend translation map for achievements returned from the API.
 * Key: achievementId (UUID from backend)
 * Value: { name, description } in Vietnamese
 *
 * Màn `AchievementsScreen` dùng `getAchievementTranslation` (UUID + fallback tên tiếng Anh).
 *
 * When backend adds new achievements, add their IDs + translations here.
 */

interface AchievementTranslation {
  vi: { name: string; description: string };
  en: { name: string; description: string };
}

export const ACHIEVEMENT_TRANSLATIONS: Record<string, AchievementTranslation> =
  {
    // Fairplay
    "9f92d60e-0713-4ccd-baba-452cd24b3e59": {
      vi: {
        name: "Tinh thần Fair Play",
        description: "Duy trì điểm fair play trên 90 trong 20 trận đấu.",
      },
      en: {
        name: "Fair Play Spirit",
        description: "Maintain a fair play score above 90 for 20 matches.",
      },
    },

    // Feedback
    "e26d854f-66f7-4252-a23b-b48b0ef809e7": {
      vi: {
        name: "Được yêu thích",
        description: "Nhận 10 phản hồi tích cực từ người chơi khác.",
      },
      en: {
        name: "Well-Liked",
        description: "Receive 10 positive feedbacks from other players.",
      },
    },
    "cf07f6ff-abbd-405d-a3ac-b8ffb8715d2f": {
      vi: {
        name: "Siêu sao",
        description: "Nhận 50 phản hồi tích cực từ người chơi khác.",
      },
      en: {
        name: "Superstar",
        description: "Receive 50 positive feedbacks from other players.",
      },
    },

    // Matches
    "b35bc9bd-0eb2-4a4d-9134-a9ae1961da61": {
      vi: {
        name: "Trận đấu đầu tiên",
        description: "Hoàn thành trận đấu đầu tiên của bạn.",
      },
      en: {
        name: "First Match",
        description: "Complete your first match.",
      },
    },
    "0090f18a-ecf4-4300-b1cb-8deef69841d0": {
      vi: {
        name: "Cầu thủ kỳ cựu",
        description: "Hoàn thành 50 trận đấu.",
      },
      en: {
        name: "Veteran Player",
        description: "Complete 50 matches.",
      },
    },

    // Other
    "628db1b6-82e3-4598-b658-61a06e677107": {
      vi: {
        name: "Người tiên phong",
        description: "Là một trong 100 người dùng đầu tiên tham gia Kickify.",
      },
      en: {
        name: "Pioneer",
        description: "Be one of the first 100 users to join Kickify.",
      },
    },

    // WinStreak
    "5854045d-1029-47e2-93d5-14aadd0c8495": {
      vi: {
        name: "Đang bùng cháy",
        description: "Thắng 3 trận liên tiếp.",
      },
      en: {
        name: "On Fire",
        description: "Win 3 consecutive matches.",
      },
    },
    "db1b01ed-9280-48a8-b094-ceb073260c7a": {
      vi: {
        name: "Không thể ngăn cản",
        description: "Thắng 10 trận liên tiếp.",
      },
      en: {
        name: "Unstoppable",
        description: "Win 10 consecutive matches.",
      },
    },
  };

/** Map i18n / store values (vi-VN, en-US, …) → key trong ACHIEVEMENT_TRANSLATIONS */
function resolveAchievementLocale(language: string): keyof AchievementTranslation {
  const l = (language ?? "").trim().toLowerCase();
  if (!l || l.startsWith("vi")) return "vi";
  return "en";
}

/**
 * Chuẩn hóa achievementId để khớp key trong map (BE có thể trả UUID hoa/thường, không gạch, có ngoặc).
 */
export function normalizeAchievementIdForLookup(raw: string | undefined | null): string {
  if (raw == null) return "";
  let s = String(raw).trim().replace(/[{}]/g, "").toLowerCase();
  if (/^[0-9a-f]{32}$/.test(s)) {
    s = `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
  }
  return s;
}

/** 32 ký tự hex không gạch → key chuẩn có gạch trong ACHIEVEMENT_TRANSLATIONS */
const COMPACT_UUID_TO_CANONICAL: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const id of Object.keys(ACHIEVEMENT_TRANSLATIONS)) {
    m[id.replace(/-/g, "")] = id;
  }
  return m;
})();

/** Trả về key có trong map, hoặc undefined */
export function resolveCanonicalAchievementId(
  raw: string | undefined | null,
): string | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = normalizeAchievementIdForLookup(raw);
  if (ACHIEVEMENT_TRANSLATIONS[n]) return n;
  const compact = n.replace(/-/g, "");
  return COMPACT_UUID_TO_CANONICAL[compact];
}

function findTranslationByEnglishName(
  englishName: string,
): AchievementTranslation | undefined {
  const t = englishName.trim().toLowerCase();
  if (!t) return undefined;
  for (const tr of Object.values(ACHIEVEMENT_TRANSLATIONS)) {
    if (tr.en.name.trim().toLowerCase() === t) return tr;
  }
  return undefined;
}

/**
 * Returns translated name and description for a given achievementId.
 * Falls back to API strings if no map entry.
 *
 * Lưu ý:
 * - UUID từ API có thể khác chữ hoa/thường; object key trong JS phân biệt → luôn lookup bằng id lowercase.
 * - `language` có thể là `vi-VN` (i18n) trong khi map chỉ có `vi` → cần resolve locale.
 */
export const getAchievementTranslation = (
  achievementId: string,
  language: string,
  fallbackName: string,
  fallbackDescription: string,
): { name: string; description: string } => {
  const locale = resolveAchievementLocale(language);

  const canonical = resolveCanonicalAchievementId(achievementId);
  let translation = canonical
    ? ACHIEVEMENT_TRANSLATIONS[canonical]
    : undefined;

  if (!translation) {
    translation = findTranslationByEnglishName(fallbackName);
  }

  if (translation) {
    const localeObj = translation[locale];
    if (localeObj) return localeObj;
  }
  return {
    name: fallbackName,
    description: fallbackDescription,
  };
};

