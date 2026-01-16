import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { MediaItem } from '@/shared/components/PostImages';

export interface PostDetailImagesProps {
  images?: ImageSourcePropType[]; // Deprecated: use media instead
  media?: MediaItem[]; // New: supports both images and videos
}

/**
 * Component để render một video item với play/pause control
 */
const VideoItem: React.FC<{ 
  source: string; 
  thumbnail?: ImageSourcePropType;
  theme: any;
}> = ({ source, thumbnail, theme }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const player = useVideoPlayer(source, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  // Listen to player status changes
  React.useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <View style={styles.videoContainer}>
      {!isPlaying && thumbnail && (
        <Image
          source={thumbnail}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
      )}
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        contentFit="contain"
      />
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePlayPause}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? 'pause-circle' : 'play-circle'}
          size={64}
          color={theme.colors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Component hiển thị từng media (ảnh/video) riêng lẻ trong PostDetailScreen
 * Mỗi media được hiển thị full width, xếp dọc
 * Video có thể bấm để xem (sử dụng expo-video API mới)
 */
export const PostDetailImages: React.FC<PostDetailImagesProps> = ({ images, media }) => {
  const { theme } = useTheme();

  // Convert images to media format for backward compatibility
  const mediaItems: MediaItem[] = media || (images ? images.map(img => ({ type: 'image' as const, source: img })) : []);

  if (!mediaItems || mediaItems.length === 0) return null;

  // Giới hạn tối đa 4 media
  const displayMedia = mediaItems.slice(0, 4);

  return (
    <View style={styles.container}>
      {displayMedia.map((item, index) => {
        const isVideo = item.type === 'video';
        
        return (
          <View 
            key={index} 
            style={[
              styles.mediaWrapper, 
              index < displayMedia.length - 1 && { marginBottom: theme.spacing.m }
            ]}
          >
            {isVideo ? (
              <VideoItem 
                source={item.source} 
                thumbnail={item.thumbnail}
                theme={theme}
              />
            ) : (
              <Image
                source={item.source}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mediaWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 300,
  },
  videoContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default PostDetailImages;
