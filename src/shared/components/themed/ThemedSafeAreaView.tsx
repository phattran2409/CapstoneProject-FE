import React from "react";
import { SafeAreaView, ViewProps } from "react-native";
import { useTheme } from "../../theme";

interface ThemedSafeAreaViewProps extends ViewProps {
  variant?: "default" | "card" | "surface";
  children?: React.ReactNode;
}

export const ThemedSafeAreaView: React.FC<ThemedSafeAreaViewProps> = ({
  variant = "default",
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case "card":
        return theme.colors.card;
      case "surface":
        return theme.colors.surface;
      default:
        return theme.colors.background;
    }
  };

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: getBackgroundColor() }, style]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
