import { ImageSourcePropType } from "react-native";

const PLACEHOLDER_IMAGE: ImageSourcePropType = require("@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png");

export const getImageSource = (image: string | any) => {
  if (typeof image === "string") {
    return image.trim()
      ? { uri: image.trim() }
      : (PLACEHOLDER_IMAGE as ImageSourcePropType);
  }
  return image || (PLACEHOLDER_IMAGE as ImageSourcePropType);
};
