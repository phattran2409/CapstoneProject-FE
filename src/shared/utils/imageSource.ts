import { ImageSourcePropType } from "react-native";

const PLACEHOLDER_IMAGE: ImageSourcePropType = require("@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png");
const DEFAULT_AVATAR: ImageSourcePropType = require("@assets/images/default_avatar.png");
export const getImageSource = (image: string | any) => {
  if (typeof image === "string") {
    return image.trim()
      ? { uri: image.trim() }
      : (PLACEHOLDER_IMAGE as ImageSourcePropType);
  }
  return image || (PLACEHOLDER_IMAGE as ImageSourcePropType);
};

export const getImageAvatar = (avatar? :{uri: string}) => {
  if (avatar && avatar.uri) {
    return avatar;
  }
  return DEFAULT_AVATAR as ImageSourcePropType;
};