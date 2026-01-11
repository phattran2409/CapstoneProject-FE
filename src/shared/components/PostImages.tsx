import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

export interface PostImagesProps {
  images: ImageSourcePropType[];
  onImagePress?: (index: number) => void;
}

/**
 * Component hiển thị ảnh cho bài post theo layout Facebook
 * Hỗ trợ tối đa 4 ảnh với các layout:
 * - 1 ảnh: Full width
 * - 2 ảnh: 2 ảnh cạnh nhau (Style 2)
 * - 3 ảnh: 1 ảnh lớn + 2 ảnh nhỏ (Style 6)
 * - 4 ảnh: Grid 2x2 (Style 8)
 */
export const PostImages: React.FC<PostImagesProps> = ({ images, onImagePress }) => {
  if (!images || images.length === 0) return null;

  // Giới hạn tối đa 4 ảnh
  const displayImages = images.slice(0, 4);

  // 1 ảnh
  if (displayImages.length === 1) {
    return (
      <View style={styles.container}>
        <Image
          source={displayImages[0]}
          style={styles.singleImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  // 2 ảnh - Style 2: 2 ảnh cạnh nhau (900x900 each)
  if (displayImages.length === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.twoImagesContainer}>
          <Image
            source={displayImages[0]}
            style={styles.twoImageItem}
            resizeMode="cover"
          />
          <Image
            source={displayImages[1]}
            style={styles.twoImageItem}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // 3 ảnh - Style 6: 1 ảnh lớn + 2 ảnh nhỏ
  if (displayImages.length === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.threeImagesContainer}>
          <Image
            source={displayImages[0]}
            style={styles.threeImageFirst}
            resizeMode="cover"
          />
          <View style={styles.threeImagesRight}>
            <Image
              source={displayImages[1]}
              style={styles.threeImageItem}
              resizeMode="cover"
            />
            <Image
              source={displayImages[2]}
              style={styles.threeImageItem}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
    );
  }

  // 4 ảnh - Style 8: Grid 2x2 (900x900 each)
  return (
    <View style={styles.container}>
      <View style={styles.fourImagesContainer}>
        {displayImages.map((img, index) => (
          <View key={index} style={styles.fourImageWrapper}>
            <Image
              source={img}
              style={styles.fourImageItem}
              resizeMode="cover"
            />
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
});

export default PostImages;
