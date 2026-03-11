import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useToast } from "@/shared/toast";

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

  const { roomId, matchResult } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubmit = useCallback(() => {
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

    console.log("Submitting field feedback:", {
      roomId,
      matchResult,
      rating,
      comment,
    });

    navigation.replace("FeedbackComplete");
  }, [rating, comment, roomId, matchResult, navigation, t, toast]);

  const renderStars = () => {
    return (
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
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleBack}
        >
          <Ionicons
            // name="chevron-back"
            // size={24}
            // color={theme.colors.textSecondary}
          />
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

      {/* Content */}
      <View style={styles.content}>
              {/* Venue Info */}
              <View
            style={[
              styles.venueCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.venueHeader}>
              <Ionicons
                name="location"
                size={16}
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
            <Text style={[styles.venueName, { color: theme.colors.text }]}>
              {t(
                "feedback.result.venueName",
                "Sân bóng Đại học Y, Hà Nội",
              )}
            </Text>
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
          disabled={rating === 0}
        >
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
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    width: "100%",
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  submitButton: {
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
  venueCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 32,
  },
  venueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  venueLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FeedbackFieldRatingScreen;

