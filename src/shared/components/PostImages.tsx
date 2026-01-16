import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';

export type MediaItem = 
  | { type: 'image'; source: ImageSourcePropType }
  | { type: 'video'; source: string; thumbnail?: ImageSourcePropType };

export interface PostImagesProps {
  images?: ImageSourcePropType[]; // Deprecated: use media instead
  media?: MediaItem[]; // New: supports both images and videos
  onImagePress?: (index: number) => void;
}

/**
 * Component hiển thị ảnh và video cho bài post theo layout Facebook
 * Hỗ trợ tối đa 4 media với các layout:
 * - 1 media: Full width
 * - 2 media: 2 media cạnh nhau (Style 2)
 * - 3 media: 1 media lớn + 2 media nhỏ (Style 6)
 * - 4 media: Grid 2x2 (Style 8)
 * Video hiển thị dạng thumbnail với badge "video"
 */
export const PostImages: React.FC<PostImagesProps> = ({ images, media, onImagePress }) => {
  const { theme } = useTheme();
  
  // Convert images to media format for backward compatibility
  const mediaItems: MediaItem[] = media || (images ? images.map(img => ({ type: 'image' as const, source: img })) : []);
  
  if (!mediaItems || mediaItems.length === 0) return null;

  // Giới hạn tối đa 4 media
  const displayMedia = mediaItems.slice(0, 4);
  
  const renderMediaItem = (item: MediaItem, imageStyle: any, index?: number) => {
    const isVideo = item.type === 'video';
    const imageSource = isVideo ? (item.thumbnail || { uri: item.source }) : item.source;
    
    return (
      <View key={index} style={{ position: 'relative' }}>
        <Image
          source={imageSource}
          style={imageStyle}
          resizeMode="cover"
        />
        {isVideo && (
          <>
            {/* Dark overlay để làm nổi bật đây là video */}
            <View style={styles.videoOverlay} />
            
            {/* Icon play lớn ở giữa */}
            <View style={styles.videoCenterIcon}>
              <Ionicons name="play-circle" size={56} color="rgba(255, 255, 255, 0.95)" />
            </View>
            
            {/* Badge "VIDEO" góc trên phải */}
            <View style={styles.videoBadge}>
              <Ionicons name="videocam" size={14} color={theme.colors.white} />
              <Text style={styles.videoBadgeText}>VIDEO</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  // 1 media
  if (displayMedia.length === 1) {
    return (
      <View style={styles.container}>
        {renderMediaItem(displayMedia[0], styles.singleImage)}
      </View>
    );
  }

  // 2 media - Style 2: 2 media cạnh nhau
  if (displayMedia.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.twoImagesContainer}>
          {renderMediaItem(displayMedia[0], styles.twoImageItem, 0)}
          {renderMediaItem(displayMedia[1], styles.twoImageItem, 1)}
        </View>
      </View>
    );
  }

  // 3 media - Style 6: 1 media lớn + 2 media nhỏ
  if (displayMedia.length === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.threeImagesContainer}>
          {renderMediaItem(displayMedia[0], styles.threeImageFirst, 0)}
          <View style={styles.threeImagesRight}>
            {renderMediaItem(displayMedia[1], styles.threeImageItem, 1)}
            {renderMediaItem(displayMedia[2], styles.threeImageItem, 2)}
          </View>
        </View>
      </View>
    );
  }

  // 4 media - Style 8: Grid 2x2
  return (
    <View style={styles.container}>
      <View style={styles.fourImagesContainer}>
        {displayMedia.map((item, index) => (
          <View key={index} style={styles.fourImageWrapper}>
            {renderMediaItem(item, styles.fourImageItem, index)}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  singleImage: {
    width: '100%',
    height: 256,
    borderRadius: 8,
  },
  twoImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 200,
  },
  twoImageItem: {
    flex: 1,
    height: '100%',
    borderRadius: 8,
  },
  threeImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 200,
  },
  threeImageFirst: {
    flex: 1,
    height: '100%',
    borderRadius: 8,
  },
  threeImagesRight: {
    flex: 1,
    gap: 4,
  },
  threeImageItem: {
    flex: 1,
    borderRadius: 8,
  },
  fourImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    height: 200,
  },
  fourImageWrapper: {
    width: '48%',
    height: '48%',
    position: 'relative',
  },
  fourImageItem: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    zIndex: 1,
  },
  videoCenterIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    zIndex: 2,
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 3,
  },
  videoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PostImages;
