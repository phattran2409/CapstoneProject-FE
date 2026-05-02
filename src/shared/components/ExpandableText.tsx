import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";

export interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  linkStyle?: StyleProp<TextStyle>;
  readMoreKey?: string;
  readLessKey?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLines = 3,
  textStyle,
  containerStyle,
  linkStyle,
  readMoreKey = "common.expandableText.readMore",
  readLessKey = "common.expandableText.readLess",
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [fullLineCount, setFullLineCount] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setFullLineCount(0);
  }, [text, maxLines]);

  const onMeasureLines = useCallback(
    (e: { nativeEvent: { lines: ReadonlyArray<unknown> } }) => {
      setFullLineCount(e.nativeEvent.lines.length);
    },
    [],
  );

  const showToggle = fullLineCount > maxLines;

  return (
    <View style={containerStyle}>
      <View style={styles.measureWrap} pointerEvents="none">
        <Text style={[textStyle, styles.measure]} onTextLayout={onMeasureLines}>
          {text}
        </Text>
      </View>
      <Text style={textStyle} numberOfLines={expanded ? undefined : maxLines}>
        {text}
      </Text>
      {showToggle ? (
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? t(readLessKey, "Show less")
              : t(readMoreKey, "Read more")
          }
        >
          <Text
            style={[
              styles.link,
              { color: theme.colors.primary },
              linkStyle,
            ]}
          >
            {expanded
              ? t(readLessKey, "Show less")
              : t(readMoreKey, "Read more")}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  measureWrap: {
    position: "absolute",
    opacity: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  measure: {
    width: "100%",
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default ExpandableText;
