module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-worklets/plugin",
      "react-native-reanimated/plugin", // Chỉ cần dòng này là đủ cho Reanimated 3
    ],
  };
};
