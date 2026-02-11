import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Path,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

export const JerseyBadge: React.FC<{
  number: number;
  accent: string;
  text: string;
}> = ({ number, accent, text }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.jerseyRow}>
      {/* Jersey SVG */}
      <Svg width={70} height={80} viewBox="0 0 70 80">
        <Defs>
          <SvgLinearGradient id="jerseyBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E2D3D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0D1B2A" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Jersey Body */}
        <Path
          d="M15 25 L15 72 Q15 76 19 76 L51 76 Q55 76 55 72 L55 25"
          fill="url(#jerseyBg)"
        />

        {/* Left Sleeve */}
        <Path d="M15 25 L5 32 Q2 35 4 40 L12 48 L15 42" fill="url(#jerseyBg)" />

        {/* Right Sleeve */}
        <Path
          d="M55 25 L65 32 Q68 35 66 40 L58 48 L55 42"
          fill="url(#jerseyBg)"
        />

        {/* Collar - Curved Downwards */}
        <Path
          d="M23 25 Q35 42 47 25 Q41 32 35 28 Q29 32 23 25 Z"
          fill={accent}
        />

        {/* Jersey Number */}
        <SvgText
          x="35"
          y="58"
          fill="#FFFFFF"
          fontSize={number > 9 ? 26 : 30}
          fontWeight="800"
          textAnchor="middle"
        >
          {number}
        </SvgText>
      </Svg>

      {/* Position Text */}
      <View style={styles.positionContainer}>
        <Text
          style={[styles.positionLabel, { color: theme.colors.textSecondary }]}
        >
          {t("personalPage.position")}
        </Text>
        <Text style={[styles.positionText, { color: theme.colors.text }]}>{text}</Text>
      </View>
    </View>
  );
  
};

const styles = StyleSheet.create({
  jerseyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  positionContainer: {
    flexDirection: "column",
  },
  positionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  positionText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

