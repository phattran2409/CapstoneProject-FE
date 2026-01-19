import React from "react";
import { View, Image, StyleSheet, TouchableOpacity, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { PostMedia } from "@/features/post/types/post.types";

const GAP = 2;

export interface PostMediaGridProps {
  media: PostMedia[];
  onMediaPress?: (index: number) => void;
}

/**
 * Component hiển thị media grid theo Facebook layout styles
 * Hỗ trợ 10 styles khác nhau dựa trên số lượng media (1-4+)
 */
export const PostMediaGrid: React.FC<PostMediaGridProps> = ({
  media,
  onMediaPress,
}) => {
  const { theme } = useTheme();

  if (!media || media.length === 0) return null;

  const sortedMedia = [...media].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const renderMediaItem = (
    item: PostMedia,
    style: any,
    index: number,
    showMoreCount?: number,
  ) => {
    const isVideo = item.mediaType === 1;
    const imageSource = { uri: item.publicUrl };

    return (
      <TouchableOpacity
        key={index}
        style={[style, { position: "relative", overflow: "hidden" }]}
        onPress={() => onMediaPress?.(index)}
        activeOpacity={0.9}
      >
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        {/* Video overlay */}
        {isVideo && (
          <>
            <View style={styles.videoOverlay} />
            <View style={styles.videoCenterIcon}>
              <Ionicons
                name="play-circle"
                size={48}
                color="rgba(255, 255, 255, 0.95)"
              />
            </View>
            <View style={styles.videoBadge}>
              <Ionicons name="videocam" size={12} color="#fff" />
            </View>
          </>
        )}

        {/* Show more overlay for 4+ images */}
        {showMoreCount && showMoreCount > 0 && (
          <View style={styles.moreOverlay}>
            <Text style={styles.moreText}>+{showMoreCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Style 1: Single image
  if (sortedMedia.length === 1) {
    return (
      <View style={styles.container}>
        {renderMediaItem(
          sortedMedia[0],
          {
            width: "100%",
            height: 400,
            borderRadius: 8,
          },
          0,
        )}
      </View>
    );
  }

  // Style 2: Two images side by side
  if (sortedMedia.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {renderMediaItem(
            sortedMedia[0],
            {
              flex: 1,
              height: 250,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            },
            0,
          )}
          {renderMediaItem(
            sortedMedia[1],
            {
              flex: 1,
              height: 250,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            },
            1,
          )}
        </View>
      </View>
    );
  }

  // Style 5: Three images (1 large + 2 small stacked)
  if (sortedMedia.length === 3) {
    const smallHeight = (250 - GAP) / 2;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {renderMediaItem(
            sortedMedia[0],
            {
              flex: 1,
              height: 250,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            },
            0,
          )}
          <View style={{ flex: 1, gap: GAP }}>
            {renderMediaItem(
              sortedMedia[1],
              {
                width: "100%",
                height: smallHeight,
                borderTopRightRadius: 8,
              },
              1,
            )}
            {renderMediaItem(
              sortedMedia[2],
              {
                width: "100%",
                height: smallHeight,
                borderBottomRightRadius: 8,
              },
              2,
            )}
          </View>
        </View>
      </View>
    );
  }

  // Style 8: Four images in 2x2 grid
  if (sortedMedia.length === 4) {
    const itemHeight = (300 - GAP) / 2;

    return (
      <View style={styles.container}>
        <View style={styles.row}>
          {renderMediaItem(
            sortedMedia[0],
            {
              flex: 1,
              height: itemHeight,
              borderTopLeftRadius: 8,
            },
            0,
          )}
          {renderMediaItem(
            sortedMedia[1],
            {
              flex: 1,
              height: itemHeight,
              borderTopRightRadius: 8,
            },
            1,
          )}
        </View>
        <View style={styles.row}>
          {renderMediaItem(
            sortedMedia[2],
            {
              flex: 1,
              height: itemHeight,
              borderBottomLeftRadius: 8,
            },
            2,
          )}
          {renderMediaItem(
            sortedMedia[3],
            {
              flex: 1,
              height: itemHeight,
              borderBottomRightRadius: 8,
            },
            3,
          )}
        </View>
      </View>
    );
  }

  // Style 10: More than 4 images (show first 3 + count)
  if (sortedMedia.length > 4) {
    const moreCount = sortedMedia.length - 3;

    return (
      <View style={styles.container}>
        {renderMediaItem(
          sortedMedia[0],
          {
            width: "100%",
            height: 250,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
          0,
        )}
        <View style={styles.row}>
          {renderMediaItem(
            sortedMedia[1],
            {
              flex: 1,
              height: 150,
              borderBottomLeftRadius: 8,
            },
            1,
          )}
          {renderMediaItem(
            sortedMedia[2],
            {
              flex: 1,
              height: 150,
            },
            2,
          )}
          {renderMediaItem(
            sortedMedia[3],
            {
              flex: 1,
              height: 150,
              borderBottomRightRadius: 8,
            },
            3,
            moreCount,
          )}
        </View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: GAP,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  videoCenterIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 2,
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 3,
  },
  moreOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 4,
  },
  moreText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
});

export default PostMediaGrid;
