import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useTheme } from "@/shared/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useGenerateSuggestionComment } from "../hooks/useFeedback";
import { getPlayerPositionMeta } from "@/shared/constants/playerPositions";
import { ExpandableText } from "@/shared/components/ExpandableText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_MULTIPLIER = 0.1;

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  jerseyNumber?: number;
}

interface SwipeableRatingCardProps {
  player: Player;
  rating: number;
  comment: string;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSwipeRight: () => void; // Confirm/Send rating
  onSwipeLeft: () => void; // Skip
  onReport?: () => void;
  onValidate?: (rating: number) => boolean; // Validation function
  isLastPlayer?: boolean; // Is this the last player?
  onComplete?: () => void; // Complete all ratings
}

const SwipeableRatingCard: React.FC<SwipeableRatingCardProps> = ({
  player,
  rating,
  comment,
  onRatingChange,
  onCommentChange,
  onSwipeRight,
  onSwipeLeft,
  onReport,
  onValidate,
  isLastPlayer = false,
  onComplete,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const generateSuggestionMutation = useGenerateSuggestionComment();
  const roleMeta = getPlayerPositionMeta(player.role);
  const roleColor = roleMeta?.color ?? theme.colors.textSecondary;
  const [sentimentModalVisible, setSentimentModalVisible] = React.useState(false);
  const [selectedSentiment, setSelectedSentiment] = React.useState<string | null>(null);

  // Sentiment levels mapped to star ratings (kept same logic as before)
  const sentimentLevels = [
    { key: "veryPositive", starRating: 5 },
    { key: "positive",     starRating: 4 },
    { key: "neutral",      starRating: 3 },
    { key: "negative",     starRating: 2 },
    { key: "veryNegative", starRating: 1 },
  ] as const;

  React.useEffect(() => {
    const generatedComment =
      generateSuggestionMutation.data?.suggestions?.[0]?.trim() ?? "";
    if (!generatedComment) return;
    onCommentChange(generatedComment);
  }, [generateSuggestionMutation.data, onCommentChange]);

  // Reset animation when player changes
  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
  }, [player.id]);

  // Pan gesture with higher activeOffsetX to prevent conflicts with taps
  const panGesture = Gesture.Pan()
    .activeOffsetX([-50, 50]) // Only activate when horizontal movement > 50px (high threshold for clear swipes)
    // Removed failOffsetY to allow vertical interactions (scrolling, tapping)
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onUpdate((event) => {
      // Only move horizontally if we've moved enough
      if (Math.abs(event.translationX) > 50) {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.2; // Less vertical movement
      }
    })
    .onEnd((event) => {
      const swipeDistance = Math.abs(event.translationX);
      const isRightSwipe = event.translationX > 0;
      const isLeftSwipe = event.translationX < 0;

      if (swipeDistance > SWIPE_THRESHOLD) {
        // Swipe confirmed
        if (isRightSwipe) {
          // Validate before confirming - check rating directly (no function call needed)
          if (rating === 0) {
            // Spring back if validation fails (no rating selected)
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
            return;
          }
          // Fast timing animation for swipe out (more predictable than spring)
          translateX.value = withTiming(
            SCREEN_WIDTH * 1.5,
            {
              duration: 200,
              easing: Easing.out(Easing.cubic),
            },
            (finished) => {
              if (finished) {
                runOnJS(onSwipeRight)();
              }
            },
          );
        } else if (isLeftSwipe) {
          translateX.value = withTiming(
            -SCREEN_WIDTH * 1.5,
            {
              duration: 200,
              easing: Easing.out(Easing.cubic),
            },
            (finished) => {
              if (finished) {
                runOnJS(onSwipeLeft)();
              }
            },
          );
        }
        opacity.value = withTiming(0, { duration: 200 });
      } else {
        // Spring back to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      }
    })
    .onFinalize(() => {
      // Reset scale when gesture ends
      scale.value = withSpring(1);
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  const onGenerateComment = async (starRating: number) => {
    if (!starRating || generateSuggestionMutation.isPending || !player.role) return;

    await generateSuggestionMutation.mutateAsync({
      starRating,
      count: 1,
      role: player.role,
    });
  };

  const onSelectSentiment = async (key: string, starRating: number) => {
    setSelectedSentiment(key);
    setSentimentModalVisible(false);
    await onGenerateComment(starRating);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              onRatingChange(star);
            }}
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
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[styles.cardContainer, cardStyle]}
        pointerEvents="box-none"
      >
        {/* Right Swipe Overlay (Confirm) */}
        <Animated.View
          style={[
            styles.overlay,
            styles.rightOverlay,
            { backgroundColor: theme.colors.primary },
            rightOverlayStyle,
          ]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={60} color="#000" />
          <Text style={styles.overlayText}>Xác nhận</Text>
        </Animated.View>

        {/* Left Swipe Overlay (Skip) */}
        <Animated.View
          style={[
            styles.overlay,
            styles.leftOverlay,
            { backgroundColor: theme.colors.textTertiary },
            leftOverlayStyle,
          ]}
          pointerEvents="none"
        >
          <Ionicons name="close-circle" size={60} color="#000" />
          <Text style={styles.overlayText}>Bỏ qua</Text>
        </Animated.View>

        {/* Card Content */}
        <View
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          pointerEvents="auto"
        >
          {/* Player Avatar */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarBorder,
                { borderColor: theme.colors.primary },
              ]}
            >
              {player.avatar ? (
                <Image source={{ uri: player.avatar }} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: theme.colors.textTertiary },
                  ]}
                >
                  <Text
                    style={[styles.avatarText, { color: theme.colors.text }]}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            {/* {player.jerseyNumber && (
              <View
                style={[
                  styles.jerseyNumber,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.jerseyNumberText,
                    { color: theme.colors.background },
                  ]}
                >
                  {player.jerseyNumber}
                </Text>
              </View>
            )} */}
          </View>

          {/* Player Name */}
          <ExpandableText
            text={player.name}
            maxLines={2}
            textStyle={[styles.playerName, { color: theme.colors.text }]}
            containerStyle={{ alignSelf: "stretch", paddingHorizontal: 8 }}
            linkStyle={{ textAlign: "center", alignSelf: "center" }}
          />

          {/* Player Role */}
          <View
            style={[
              styles.playerRoleBadge,
              {
                borderColor: roleColor,
                backgroundColor: `${roleColor}20`,
              },
            ]}
          >
            <Text style={[styles.playerRole, { color: roleColor }]}>
              {roleMeta?.label ?? player.role}
            </Text>
          </View>

          {/* Rating Instruction */}
          <Text
            style={[styles.ratingInstruction, { color: theme.colors.primary }]}
          >
            {t("feedback.rating.touchToRate", "CHẠM ĐỂ ĐÁNH GIÁ")}
          </Text>

          {/* Stars */}
          <View>{renderStars()}</View>

          {/* Comment Input */}
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder={t("feedback.rating.commentPlaceholder", "Nhận xét ngắn... (không bắt buộc)")}
            placeholderTextColor={theme.colors.textTertiary}
            value={comment}
            onChangeText={onCommentChange}
            multiline
            maxLength={200}
          />

          {/* Sentiment Dropdown */}
          <Text style={[styles.sentimentLabel, { color: theme.colors.textSecondary }]}>
            {t("feedback.rating.sentimentLabel", "Tạo nhận xét theo mức độ")}
          </Text>
          <TouchableOpacity
            style={[
              styles.sentimentSelector,
              {
                borderColor: theme.colors.neonGreen,
                backgroundColor: theme.colors.neonGreen + "1A",
                opacity: generateSuggestionMutation.isPending ? 0.6 : 1,
              },
            ]}
            onPress={() => { if (!generateSuggestionMutation.isPending) setSentimentModalVisible(true); }}
            activeOpacity={0.75}
            disabled={generateSuggestionMutation.isPending}
          >
            {generateSuggestionMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.neonGreen} />
            ) : (
              <Ionicons name="chatbox-ellipses-outline" size={20} color={theme.colors.neonGreen} />
            )}
            <Text style={[styles.sentimentSelectorText, { color: theme.colors.neonGreen }]}>
              {generateSuggestionMutation.isPending
                ? t("common.loading", "Đang tạo...")
                : selectedSentiment
                  ? t(`feedback.rating.sentimentLevels.${selectedSentiment}`, selectedSentiment)
                  : t("feedback.rating.sentimentPlaceholder", "Chọn mức độ nhận xét...")}
            </Text>
            <Ionicons
              name={sentimentModalVisible ? "chevron-up" : "chevron-down"}
              size={16}
              color={theme.colors.neonGreen}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

          {/* Sentiment Modal */}
          <Modal
            visible={sentimentModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setSentimentModalVisible(false)}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setSentimentModalVisible(false)}
            >
              <Pressable
                style={[
                  styles.modalSheet,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {t("feedback.rating.sentimentLabel", "Tạo nhận xét theo mức độ")}
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {sentimentLevels.map(({ key, starRating }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sentimentOption,
                        {
                          backgroundColor:
                            selectedSentiment === key
                              ? theme.colors.neonGreen + "22"
                              : "transparent",
                          borderColor:
                            selectedSentiment === key
                              ? theme.colors.neonGreen
                              : theme.colors.border,
                        },
                      ]}
                      onPress={() => { void onSelectSentiment(key, starRating); }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sentimentOptionText,
                          {
                            color:
                              selectedSentiment === key
                                ? theme.colors.neonGreen
                                : theme.colors.text,
                            fontWeight: selectedSentiment === key ? "700" : "400",
                          },
                        ]}
                      >
                        {t(`feedback.rating.sentimentLevels.${key}`, key)}
                      </Text>
                      {selectedSentiment === key && (
                        <Ionicons name="checkmark" size={18} color={theme.colors.neonGreen} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
          {/* Report Button */}
          {onReport && (
            <TouchableOpacity
              style={styles.reportButton}
              onPress={onReport}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flag-outline"
                size={16}
                color={theme.colors.error}
              />
              <Text
                style={[styles.reportButtonText, { color: theme.colors.error }]}
              >
                {t(
                  "feedback.report.button",
                  "Báo cáo người chơi này",
                )}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    minHeight: 500,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  rightOverlay: {
    backgroundColor: "#97FB57",
  },
  leftOverlay: {
    backgroundColor: "#909090",
  },
  overlayText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginTop: 8,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "700",
  },
  jerseyNumber: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  jerseyNumberText: {
    fontSize: 16,
    fontWeight: "700",
  },
  playerName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  playerRole: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  playerRoleBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  ratingInstruction: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    width: "100%",
    minHeight: 80,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  completeButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  reportButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  generateCommentButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  generateCommentButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sentimentLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  sentimentSelector: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sentimentSelectorText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
    textAlign: "center",
  },
  sentimentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  sentimentOptionText: {
    fontSize: 14,
  },
});

export default SwipeableRatingCard;
