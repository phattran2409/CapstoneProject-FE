import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ThemedSafeAreaView,
  ThemedText,
  ThemedView,
} from "@/shared/components/themed";
import { RootStackParamList } from "@/app/navigation/types";
import { useCreatePost } from "../hooks/useMutationPost";
import { validateContent } from "@/shared/utils/validation";
import { PostMediaGrid } from "@/shared/components/PostMediaGrid";
import { PostMedia } from "../types/post.types";
import { useAuthStore } from "@/features/auth";
import * as ImagePicker from "expo-image-picker";

type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreatePost"
>;

interface CreatePostScreenProps {
  navigation: CreatePostScreenNavigationProp;
}

interface SelectedMedia {
  uri: string;
  type: "image" | "video";
  mimeType: string;
  fileName: string;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { mutateAsync: createPost, isPending } = useCreatePost();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const [contentError, setContentError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Request permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        t("post.permissions.title", { defaultValue: "Quyền truy cập" }),
        t("post.permissions.message", {
          defaultValue:
            "Cần quyền truy cập camera và thư viện để chọn ảnh/video",
        }),
      );
      return false;
    }
    return true;
  };

  // Pick media from library
  const pickMedia = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Check current media count
    if (media.length >= 4) {
      Alert.alert(
        t("post.media.maxReached", { defaultValue: "Đã đạt giới hạn" }),
        t("post.media.maxReachedMessage", {
          defaultValue: "Bạn chỉ có thể tải lên tối đa 4 media",
        }),
      );
      return;
    }

    // Check if video already exists
    const hasVideo = media.some((m) => m.type === "video");
    if (hasVideo) {
      Alert.alert(
        t("post.media.videoExists", { defaultValue: "Đã có video" }),
        t("post.media.videoExistsMessage", {
          defaultValue:
            "Bạn chỉ có thể tải lên 1 video. Nếu muốn thêm video mới, vui lòng xóa video hiện tại.",
        }),
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      });

      if (!result.canceled && result.assets) {
        const newMedia: SelectedMedia[] = result.assets
          .slice(0, 4 - media.length) // Limit to remaining slots
          .map((asset) => {
            const isVideo = asset.type === "video";
            const mimeType = isVideo
              ? asset.mimeType || "video/mp4"
              : asset.mimeType || "image/jpeg";
            const fileName =
              asset.fileName ||
              `media_${Date.now()}.${isVideo ? "mp4" : "jpg"}`;

            return {
              uri: asset.uri,
              type: isVideo ? ("video" as const) : ("image" as const),
              mimeType,
              fileName,
            };
          });

        // Validate: only 1 video total
        const totalVideos =
          media.filter((m) => m.type === "video").length +
          newMedia.filter((m) => m.type === "video").length;
        if (totalVideos > 1) {
          Alert.alert(
            t("post.media.oneVideoOnly", { defaultValue: "Chỉ được 1 video" }),
            t("post.media.oneVideoOnlyMessage", {
              defaultValue: "Bạn chỉ có thể tải lên tối đa 1 video",
            }),
          );
          return;
        }

        // Validate: max 4 total
        const totalMedia = media.length + newMedia.length;
        if (totalMedia > 4) {
          const allowedCount = 4 - media.length;
          setMedia([...media, ...newMedia.slice(0, allowedCount)]);
        } else {
          setMedia([...media, ...newMedia]);
        }
        setMediaError(null);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert(
        t("post.media.error", { defaultValue: "Lỗi" }),
        t("post.media.errorMessage", {
          defaultValue: "Không thể chọn media. Vui lòng thử lại.",
        }),
      );
    }
  }, [media, t]);

  // Take photo or video with camera
  const takePhoto = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Check current media count
    if (media.length >= 4) {
      Alert.alert(
        t("post.media.maxReached", { defaultValue: "Đã đạt giới hạn" }),
        t("post.media.maxReachedMessage", {
          defaultValue: "Bạn chỉ có thể tải lên tối đa 4 media",
        }),
      );
      return;
    }

    // Check if video already exists
    const hasVideo = media.some((m) => m.type === "video");

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: hasVideo
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const isVideo = asset.type === "video";
        const mimeType = isVideo
          ? asset.mimeType || "video/mp4"
          : asset.mimeType || "image/jpeg";
        const fileName =
          asset.fileName || `camera_${Date.now()}.${isVideo ? "mp4" : "jpg"}`;

        const newMedia: SelectedMedia = {
          uri: asset.uri,
          type: isVideo ? "video" : "image",
          mimeType,
          fileName,
        };

        // Validate: only 1 video total
        if (isVideo && hasVideo) {
          Alert.alert(
            t("post.media.oneVideoOnly", { defaultValue: "Chỉ được 1 video" }),
            t("post.media.oneVideoOnlyMessage", {
              defaultValue: "Bạn chỉ có thể tải lên tối đa 1 video",
            }),
          );
          return;
        }

        setMedia([...media, newMedia]);
        setMediaError(null);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        t("post.media.error", { defaultValue: "Lỗi" }),
        t("post.media.errorMessage", {
          defaultValue: "Không thể chụp ảnh/quay video. Vui lòng thử lại.",
        }),
      );
    }
  }, [media, t]);

  // Remove media
  const removeMedia = useCallback(
    (index: number) => {
      setMedia(media.filter((_, i) => i !== index));
      setMediaError(null);
    },
    [media],
  );

  // Validate before submit
  const validate = (): boolean => {
    // Validate content
    const contentValidation = validateContent(content);
    if (!contentValidation.isValid) {
      setContentError(
        t(contentValidation.errorKey || "actionButton.validation.required", {
          defaultValue: "Nội dung không được để trống",
        }),
      );
      return false;
    }
    setContentError(null);

    // Media is optional, but if provided, validate count
    if (media.length > 4) {
      setMediaError(
        t("post.media.maxReachedMessage", {
          defaultValue: "Tối đa 4 media",
        }),
      );
      return false;
    }

    // Validate video count
    const videoCount = media.filter((m) => m.type === "video").length;
    if (videoCount > 1) {
      setMediaError(
        t("post.media.oneVideoOnlyMessage", {
          defaultValue: "Chỉ được 1 video",
        }),
      );
      return false;
    }

    setMediaError(null);
    return true;
  };

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    try {
      // Convert SelectedMedia[] to File[] format for FormData
      const files = media.map((m) => {
        // In React Native, we use object format for FormData
        return {
          uri: m.uri,
          type: m.mimeType,
          name: m.fileName,
        } as any;
      });

      await createPost({
        content: content.trim(),
        files: files.length > 0 ? files : [],
      });

      // Success - navigate back
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert(
        t("post.create.error", { defaultValue: "Lỗi" }),
        t("post.create.errorMessage", {
          defaultValue: "Không thể tạo bài viết. Vui lòng thử lại.",
        }),
      );
    }
  }, [content, media, createPost, navigation, t]);

  // Convert SelectedMedia to PostMedia for display
  const displayMedia: PostMedia[] = media.map((m, index) => ({
    mediaId: `temp_${index}`,
    publicUrl: m.uri,
    mediaType: m.type === "video" ? 1 : 0,
    displayOrder: index,
  }));

  const canPost = content.trim().length > 0 && !isPending;

  return (
    <ThemedSafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        {/* Header */}
        <ThemedView
          style={[
            styles.header,
            {
              paddingHorizontal: theme.spacing.l,
              paddingVertical: theme.spacing.m,
              marginTop: theme.spacing.xl,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary">
            {t("post.create.title", { defaultValue: "Tạo bài viết" })}
          </ThemedText>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canPost}
            style={[
              styles.postButton,
              {
                backgroundColor: canPost
                  ? theme.colors.neonGreen
                  : theme.colors.border,
              },
            ]}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={theme.colors.darkBlack} />
            ) : (
              <ThemedText
                size="m"
                weight="bold"
                style={{
                  color: canPost
                    ? theme.colors.darkBlack
                    : theme.colors.textSecondary,
                }}
              >
                {t("post.create.button", { defaultValue: "Đăng" })}
              </ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* User Profile */}
          <View
            style={[
              styles.userSection,
              {
                paddingHorizontal: theme.spacing.l,
                paddingVertical: theme.spacing.m,
              },
            ]}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: theme.colors.border,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Ionicons
                  name="person"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </View>
            )}
            <ThemedText variant="primary" size="m" weight="bold">
              {user?.fullName ||
                t("post.create.user", { defaultValue: "Người dùng" })}
            </ThemedText>
          </View>

          {/* Content Input */}
          <View
            style={[
              styles.contentSection,
              {
                paddingHorizontal: theme.spacing.l,
              },
            ]}
          >
            <TextInput
              style={[
                styles.contentInput,
                {
                  color: theme.colors.text,
                  fontSize: 16,
                  lineHeight: 24,
                },
              ]}
              placeholder={t("post.create.placeholder", {
                defaultValue: "Bạn đang nghĩ gì?",
              })}
              placeholderTextColor={theme.colors.textSecondary}
              value={content}
              onChangeText={(text) => {
                setContent(text);
                setContentError(null);
              }}
              multiline
              maxLength={5000}
              textAlignVertical="top"
            />
            {contentError && (
              <ThemedText
                variant="error"
                size="s"
                style={{ marginTop: theme.spacing.xs }}
              >
                {contentError}
              </ThemedText>
            )}
          </View>

          {/* Media Preview */}
          {media.length > 0 && (
            <View
              style={[
                styles.mediaSection,
                {
                  paddingHorizontal: theme.spacing.l,
                  marginBottom: theme.spacing.m,
                },
              ]}
            >
              <PostMediaGrid
                media={displayMedia}
                onMediaPress={(index) => {
                  // Show option to remove
                  Alert.alert(
                    t("post.media.remove", { defaultValue: "Xóa media" }),
                    t("post.media.removeConfirm", {
                      defaultValue: "Bạn có muốn xóa media này?",
                    }),
                    [
                      {
                        text: t("common.cancel", { defaultValue: "Hủy" }),
                        style: "cancel",
                      },
                      {
                        text: t("common.delete", { defaultValue: "Xóa" }),
                        style: "destructive",
                        onPress: () => removeMedia(index),
                      },
                    ],
                  );
                }}
              />
            </View>
          )}

          {mediaError && (
            <View
              style={[
                styles.errorSection,
                {
                  paddingHorizontal: theme.spacing.l,
                },
              ]}
            >
              <ThemedText variant="error" size="s">
                {mediaError}
              </ThemedText>
            </View>
          )}

          {/* Add Media Section */}
          <View
            style={[
              styles.addMediaSection,
              {
                paddingHorizontal: theme.spacing.l,
                paddingTop: theme.spacing.m,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText
              variant="secondary"
              size="m"
              weight="medium"
              style={{ marginBottom: theme.spacing.m }}
            >
              {t("post.create.addMedia", { defaultValue: "Thêm vào bài viết" })}
            </ThemedText>
            <View style={styles.mediaOptions}>
              <TouchableOpacity
                style={[
                  styles.mediaOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={pickMedia}
                disabled={media.length >= 4 || isPending}
              >
                <Ionicons
                  name="images"
                  size={24}
                  color={
                    media.length >= 4
                      ? theme.colors.textSecondary
                      : theme.colors.primary
                  }
                />
                <ThemedText
                  variant="secondary"
                  size="s"
                  style={{ marginTop: theme.spacing.xs }}
                >
                  {t("post.create.photoVideo", { defaultValue: "Ảnh/Video" })}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mediaOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={takePhoto}
                disabled={media.length >= 4 || isPending}
              >
                <Ionicons
                  name="camera"
                  size={24}
                  color={
                    media.length >= 4
                      ? theme.colors.textSecondary
                      : theme.colors.primary
                  }
                />
                <ThemedText
                  variant="secondary"
                  size="s"
                  style={{ marginTop: theme.spacing.xs }}
                >
                  {t("post.create.camera", { defaultValue: "Camera" })}
                </ThemedText>
              </TouchableOpacity>
            </View>
            {media.length > 0 && (
              <ThemedText
                variant="secondary"
                size="xs"
                style={{ marginTop: theme.spacing.s }}
              >
                {t("post.create.mediaCount", {
                  defaultValue: "{{count}}/4 media đã chọn",
                  count: media.length,
                })}
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentSection: {
    marginTop: 12,
  },
  contentInput: {
    minHeight: 120,
    maxHeight: 300,
  },
  mediaSection: {
    marginTop: 12,
  },
  errorSection: {
    marginTop: 8,
  },
  addMediaSection: {
    marginTop: 12,
  },
  mediaOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaOption: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreatePostScreen;
