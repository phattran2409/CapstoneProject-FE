import { ImageSourcePropType } from 'react-native';

const PLACEHOLDER_IMAGE: ImageSourcePropType = require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png');

export const getImageSource = (image?: string | null): ImageSourcePropType => {
  if (typeof image === 'string') {
    const trimmed = image.trim();
    if (trimmed.length > 0) {
      return { uri: trimmed };
    }
  }
  return PLACEHOLDER_IMAGE;
};