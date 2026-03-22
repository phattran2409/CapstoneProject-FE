import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToast } from "@/shared/toast";
import { useFeedbackSessionStore } from "../store/feedbackSessionStore";
import { useFeedbackVenue } from "../hooks/useFeedback";
import { useVenueDetail } from "@/features/venues";
import { openMapsSearch } from "@/shared/utils/maps";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 220;
const THUMB_SIZE = 72;

type FeedbackFieldRatingNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FeedbackFieldRating"
>;

type FeedbackFieldRatingRouteProp = RouteProp<
  RootStackParamList,
  "FeedbackFieldRating"
>;

interface FeedbackFieldRatingProps {
  navigation: FeedbackFieldRatingNavigationProp;
  route: FeedbackFieldRatingRouteProp;
}

const FeedbackFieldRatingScreen: React.FC<FeedbackFieldRatingProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const session = useFeedbackSessionStore((s) => s.session);
  const setFieldRating = useFeedbackSessionStore((s) => s.setFieldRating);

  const routeVenueId = route.params?.venueId;
  const venueId = routeVenueId ?? session?.venue?.venueId ?? "";

  const { data: venueDetail, isLoading: isVenueLoading } =
    useVenueDetail(venueId);
  const feedbackVenueMutation = useFeedbackVenue();

  const [rating, setRating] = useState(() => session?.fieldRating ?? 0);
  const [comment, setComment] = useState(() => session?.fieldComment ?? "");
  const [heroIndex, setHeroIndex] = useState(0);

  const displayVenueName = useMemo(
    () =>
      venueDetail?.venueName ??
      session?.venue?.venueName ??
      t("feedback.result.venueName", "Sân bóng"),
    [venueDetail?.venueName, session?.venue?.venueName, t],
  );

  const displayAddress = useMemo(
    () => venueDetail?.address ?? session?.venue?.address ?? "",
    [venueDetail?.address, session?.venue?.address],
  );

  const displayFieldName = session?.venue?.fieldName;

  const photoUrls = useMemo(() => {
    const fromApi =
      venueDetail?.photos
        ?.slice()
        .sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))
        .map((p) => p.photoUrl)
        .filter(Boolean) ?? [];
    if (fromApi.length > 0) return fromApi;
    return session?.venue?.photoUrls?.filter(Boolean) ?? [];
  }, [venueDetail?.photos, session?.venue?.photoUrls]);

  const lat = venueDetail?.latitude;
  const lng = venueDetail?.longitude;

  const openMaps = useCallback(() => {
    openMapsSearch({
      latitude: lat,
      longitude: lng,
      placeName: displayVenueName,
      address: displayAddress,
    });
  }, [lat, lng, displayVenueName, displayAddress]);

  // const handleBack = () => {
  //   navigation.goBack();
  // };

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      toast.error(
        t("feedback.validation.ratingRequired", "Đánh giá bắt buộc"),
        t(
          "feedback.validation.ratingRequiredMessage",
          "Vui lòng chọn số sao đánh giá trước khi gửi.",
        ),
      );
      return;
    }

    if (!venueId) {
      toast.error(
        t("feedback.field.missingVenueTitle", "Thiếu venue"),
        t(
          "feedback.field.missingVenueMessage",
          "Không xác định được sân để gửi đánh giá.",
        ),
      );
      return;
    }

    try {
      await feedbackVenueMutation.mutateAsync({
        venueId,
        rating,
        comment,
      });
      await setFieldRating(rating, comment);
      navigation.replace("FeedbackComplete");
    } catch {
      toast.error(
        t("feedback.field.submitErrorTitle", "Gửi đánh giá thất bại"),
        t(
          "feedback.field.submitErrorMessage",
          "Vui lòng thử lại sau.",
        ),
      );
    }
  }, [
    rating,
    comment,
    venueId,
    feedbackVenueMutation,
    setFieldRating,
    navigation,
    t,
    toast,
  ]);

  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          style={styles.starButton}
        >
          <Ionicons
            name={star <= rating ? "star" : "star-outline"}
            size={32}
            color={
              star <= rating
                ? theme.colors.primary
                : theme.colors.textTertiary
            }
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const heroUri = photoUrls[heroIndex] ?? photoUrls[0];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("feedback.field.title", "Đánh giá Sân bóng")}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t("feedback.field.subtitle", "Chọn số sao và nhận xét nhanh")}
          </Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ảnh sân */}
        <View
          style={[
            styles.heroWrap,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          {isVenueLoading && photoUrls.length === 0 ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : heroUri ? (
            <Image
              source={{ uri: heroUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={48}
                color={theme.colors.textTertiary}
              />
              <Text
                style={[
                  styles.heroPlaceholderText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("feedback.field.noPhotos", "Chưa có ảnh sân")}
              </Text>
            </View>
          )}

          {photoUrls.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbRow}
              contentContainerStyle={styles.thumbRowContent}
            >
              {photoUrls.map((uri, i) => (
                <TouchableOpacity
                  key={`${uri}-${i}`}
                  onPress={() => setHeroIndex(i)}
                  activeOpacity={0.85}
                  style={[
                    styles.thumbWrap,
                    i === heroIndex && {
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Image
                    source={{ uri }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Tên + địa chỉ + bản đồ */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.venueHeader}>
            <Ionicons
              name="location"
              size={18}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.venueLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t("feedback.result.venueLabel", "SÂN VẬN ĐỘNG")}
            </Text>
          </View>

          <Text style={[styles.venueTitle, { color: theme.colors.text }]}>
            {displayFieldName
              ? `${displayFieldName} · ${displayVenueName}`
              : displayVenueName}
          </Text>

          {!!displayAddress && (
            <Text
              style={[
                styles.addressText,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={3}
            >
              {displayAddress}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.mapButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={openMaps}
            activeOpacity={0.8}
          >
            <Ionicons
              name="map-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.mapButtonText, { color: theme.colors.primary }]}
            >
              {t("feedback.field.openMap", "Xem vị trí trên bản đồ")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("feedback.field.ratingLabel", "Bạn hài lòng với mặt sân chứ?")}
        </Text>

        {renderStars()}

        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t(
            "feedback.field.commentLabel",
            "Nhận xét nhanh về chất lượng sân",
          )}
        </Text>

        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder={t(
            "feedback.field.commentPlaceholder",
            "Ví dụ: Mặt cỏ đẹp, ánh sáng tốt, phòng thay đồ sạch sẽ...",
          )}
          placeholderTextColor={theme.colors.textTertiary}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={300}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor:
                rating > 0 ? theme.colors.primary : theme.colors.textTertiary,
              opacity: rating > 0 ? 1 : 0.6,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={rating === 0 || feedbackVenueMutation.isPending}
        >
          {feedbackVenueMutation.isPending ? (
            <ActivityIndicator color={theme.colors.background} />
          ) : (
            <>
              <Text
                style={[
                  styles.submitButtonText,
                  { color: theme.colors.background },
                ]}
              >
                {t("feedback.field.submit", "HOÀN THÀNH ĐÁNH GIÁ")}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.background}
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 40,
    height: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImage: {
    width: SCREEN_WIDTH - 32,
    height: HERO_HEIGHT,
  },
  heroLoading: {
    width: SCREEN_WIDTH - 32,
    height: HERO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlaceholder: {
    width: SCREEN_WIDTH - 32,
    height: HERO_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  heroPlaceholderText: {
    fontSize: 14,
  },
  thumbRow: {
    maxHeight: THUMB_SIZE + 16,
  },
  thumbRowContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
  },
  venueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  venueLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    marginHorizontal: 24,
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  submitButton: {
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default FeedbackFieldRatingScreen;
