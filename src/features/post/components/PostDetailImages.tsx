import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/shared/theme';

export interface PostDetailImagesProps {
  images: ImageSourcePropType[];
}

/**
 * Component hiển thị từng ảnh riêng lẻ trong PostDetailScreen
 * Mỗi ảnh được hiển thị full width, xếp dọc
 */
export const PostDetailImages: React.FC<PostDetailImagesProps> = ({ images }) => {
  const { theme } = useTheme();

  if (!images || images.length === 0) return null;

  // Giới hạn tối đa 4 ảnh
  const displayImages = images.slice(0, 4);

  return (
    <View style={styles.container}>
      {displayImages.map((img, index) => (
        <View 
          key={index} 
          style={[
            styles.imageWrapper, 
            index < displayImages.length - 1 && { marginBottom: theme.spacing.m }
          ]}
        >
          <Image
            source={img}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 300,
  },
});

export default PostDetailImages;
