import { Linking, Platform } from "react-native";

export type OpenMapsOptions = {
  latitude?: number | null;
  longitude?: number | null;
  /** Tên địa điểm (geo label trên Android, fallback query) */
  placeName?: string | null;
  /** Địa chỉ — dùng khi không có tọa độ */
  address?: string | null;
};

/**
 * Mở Maps / Google Maps giống FeedbackFieldRatingScreen:
 * - Có lat/lng → maps: / geo: / web search theo tọa độ
 * - Không → search theo địa chỉ hoặc tên
 */
export function openMapsSearch(options: OpenMapsOptions): void {
  const lat = options.latitude;
  const lng = options.longitude;
  const placeName = options.placeName?.trim() ?? "";
  const address = options.address?.trim() ?? "";

  const label = encodeURIComponent(placeName || address || "location");

  if (
    lat != null &&
    lng != null &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    const url =
      Platform.OS === "ios"
        ? `maps:0,0?q=${lat},${lng}`
        : Platform.OS === "android"
          ? `geo:0,0?q=${lat},${lng}(${label})`
          : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    void Linking.openURL(url);
    return;
  }

  const q = encodeURIComponent(address || placeName);
  void Linking.openURL(
    `https://www.google.com/maps/search/?api=1&query=${q}`,
  );
}
