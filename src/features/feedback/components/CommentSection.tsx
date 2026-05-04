import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  type ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useGenerateSuggestionComment } from "../hooks/useFeedback";

/** Template comments keyed by star rating (1–5) */
const COMMENT_TEMPLATES: Record<number, string[]> = {
  1: [
    "Chơi không đạt yêu cầu",
    "Cần cải thiện nhiều",
    "Không hợp tác với đồng đội",
    "Thái độ kém",
  ],
  2: [
    "Cần cố gắng thêm",
    "Kỹ năng còn hạn chế",
    "Đôi khi thiếu tập trung",
    "Cần luyện tập thêm",
  ],
  3: [
    "Chơi ổn định",
    "Đạt mức trung bình",
    "Có thể tốt hơn",
    "Không nổi bật nhưng ổn",
  ],
  4: [
    "Chơi tốt",
    "Đóng góp tích cực cho đội",
    "Kỹ thuật tốt",
    "Tinh thần đồng đội cao",
  ],
  5: [
    "Xuất sắc!",
    "Màn trình diễn tuyệt vời",
    "Cầu thủ nổi bật nhất trận",
    "Lãnh đạo đội tuyệt vời",
  ],
};

const sentimentLevels = [
  { key: "veryPositive", starRating: 5 },
  { key: "positive", starRating: 4 },
  { key: "neutral", starRating: 3 },
  { key: "negative", starRating: 2 },
  { key: "veryNegative", starRating: 1 },
] as const;

export interface CommentSectionProps {
  /** Current star rating (0 = none selected) */
  rating: number;
  /** Current comment value */
  comment: string;
  /** Called when comment changes */
  onCommentChange: (text: string) => void;
  /** Player role (for AI suggestions), optional */
  playerRole?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Max height for the ScrollView wrapper (default 140) */
  maxHeight?: number;
  /** Optional container style (e.g. alignSelf: 'stretch') */
  style?: ViewStyle;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  rating,
  comment,
  onCommentChange,
  playerRole,
  placeholder,
  maxHeight = 140,
  style,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const generateSuggestionMutation = useGenerateSuggestionComment();
  const [sentimentModalVisible, setSentimentModalVisible] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);

  // Sync selectedSentiment with rating
  React.useEffect(() => {
    if (!rating) {
      setSelectedSentiment(null);
      return;
    }
    const matched = sentimentLevels.find((l) => l.starRating === rating);
    setSelectedSentiment(matched?.key ?? null);
  }, [rating]);

  // Set comment from AI result
  React.useEffect(() => {
    const generated = generateSuggestionMutation.data?.suggestions?.[0]?.trim() ?? "";
    if (!generated) return;
    onCommentChange(generated);
  }, [generateSuggestionMutation.data]);

  const onSelectSentiment = async (key: string, starRating: number) => {
    setSelectedSentiment(key);
    setSentimentModalVisible(false);
    if (!starRating || generateSuggestionMutation.isPending || !playerRole) return;
    await generateSuggestionMutation.mutateAsync({
      starRating,
      count: 1,
      role: playerRole,
    });
  };

  const templates = rating >= 1 && rating <= 5 ? COMMENT_TEMPLATES[rating] : [];

  return (
    <View style={style}>
      {/* Quick template chips */}
      {templates.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
          keyboardShouldPersistTaps="handled"
        >
          {templates.map((tpl, idx) => {
            const isSelected = comment === tpl;
            return (
              <TouchableOpacity
                key={tpl}
                style={[
                  styles.chip,
                  {
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: isSelected
                      ? `${theme.colors.primary}22`
                      : theme.colors.background,
                    marginRight: idx < templates.length - 1 ? 8 : 0,
                  },
                ]}
                onPress={() => onCommentChange(isSelected ? "" : tpl)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {tpl}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* TextInput */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ maxHeight }}
        nestedScrollEnabled
      >
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: theme.colors.background,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder={
            placeholder ??
            t("feedback.rating.commentPlaceholder", "Nhận xét ngắn... (không bắt buộc)")
          }
          placeholderTextColor={theme.colors.textTertiary}
          value={comment}
          onChangeText={onCommentChange}
          multiline
          maxLength={200}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* AI generation row – only shown when playerRole is provided */}
      {!!playerRole && (
        <>
          <View style={styles.aiTitleRow}>
            <FontAwesome5 name="robot" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.aiLabel, { color: theme.colors.textSecondary }]}>
              {t("feedback.rating.sentimentLabel", "Tạo nhận xét theo mức độ")}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.aiSelector,
              {
                borderColor: theme.colors.neonGreen,
                backgroundColor: theme.colors.neonGreen + "1A",
                opacity: generateSuggestionMutation.isPending ? 0.6 : 1,
              },
            ]}
            onPress={() => {
              if (!generateSuggestionMutation.isPending) setSentimentModalVisible(true);
            }}
            activeOpacity={0.75}
            disabled={generateSuggestionMutation.isPending}
          >
            {generateSuggestionMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.neonGreen} />
            ) : (
              <Ionicons name="chatbox-ellipses-outline" size={18} color={theme.colors.neonGreen} />
            )}
            <Text style={[styles.aiSelectorText, { color: theme.colors.neonGreen }]}>
              {generateSuggestionMutation.isPending
                ? t("common.loading", "Đang tạo...")
                : selectedSentiment
                  ? t(`feedback.rating.sentimentLevels.${selectedSentiment}`, selectedSentiment)
                  : t("feedback.rating.sentimentPlaceholder", "Chọn mức độ nhận xét...")}
            </Text>
            <Ionicons
              name={sentimentModalVisible ? "chevron-up" : "chevron-down"}
              size={14}
              color={theme.colors.neonGreen}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>

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
                style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}
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
                        <Ionicons name="checkmark" size={16} color={theme.colors.neonGreen} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chipsScroll: {
    marginBottom: 10,
  },
  chipsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
  },
  aiTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  aiSelector: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  aiSelectorText: {
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

export default CommentSection;
