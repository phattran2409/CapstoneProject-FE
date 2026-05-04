import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText, G } from "react-native-svg";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";

interface BackendRadarData {
  form: number;
  winRate: number;
  communityScore: number;
  trust: number;
  contribution: number;
}

interface RadarChartData {
  form: number;
  winRate: number;
  communityScore: number;
  trust: number;
  contribution: number;
}

interface RadarChartProps {
  data?: Partial<BackendRadarData>;
  size?: number;
}

const MOCK_DATA: Partial<BackendRadarData> = {
  form: 0.35,
  winRate: 0.75,
  communityScore: 0.68,
  trust: 87,
  contribution: 0.6,
};

const transformRadarData = (data: Partial<BackendRadarData>): RadarChartData => {
  const safeNum = (val: number | undefined | null, fallback = 0) =>
    typeof val === "number" && !isNaN(val) ? val : fallback;

  return {
    form: ((safeNum(data.form) + 1) / 2) * 100,
    winRate: safeNum(data.winRate) * 100,
    communityScore: safeNum(data.communityScore) * 100,
    trust: safeNum(data.trust),
    contribution: safeNum(data.contribution) * 100,
  };
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_SIZE = Math.min(SCREEN_WIDTH - 64, 320);
const MAX_VALUE = 100;
const START_ANGLE = -Math.PI / 2;
const ANGLE_STEP = (2 * Math.PI) / 5;

const AXES = [
  { i18nKey: "form", key: "form", angle: START_ANGLE, labelDx: 0, defaultLabel: "Form" },
  { i18nKey: "winRate", key: "winRate", angle: START_ANGLE + ANGLE_STEP, labelDx: -10, defaultLabel: "WinRate" },
  { i18nKey: "community", key: "communityScore", angle: START_ANGLE + 2 * ANGLE_STEP, labelDx: 0, defaultLabel: "Community" },
  { i18nKey: "trust", key: "trust", angle: START_ANGLE + 3 * ANGLE_STEP, labelDx: 0, defaultLabel: "Trust" },
  {
    i18nKey: "contribution",
    key: "contribution",
    angle: START_ANGLE + 4 * ANGLE_STEP,
    labelDx: 18,
    defaultLabel: "Contribution",
  },
] as const;

export const RadarChart: React.FC<RadarChartProps> = ({ data, size = CHART_SIZE }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const center = size / 2;
  const radius = size * 0.38;
  const radarData = transformRadarData(data || MOCK_DATA);

  const getPoint = (angle: number, value: number) => {
    const clampedValue = Math.max(0, Math.min(value, MAX_VALUE));
    const normalizedValue = clampedValue / MAX_VALUE;
    return {
      x: center + radius * normalizedValue * Math.cos(angle),
      y: center + radius * normalizedValue * Math.sin(angle),
    };
  };

  const points = AXES.map((axis) =>
    getPoint(axis.angle, radarData[axis.key as keyof RadarChartData]),
  );
  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const axisLines = AXES.map((axis) => {
    const end = getPoint(axis.angle, MAX_VALUE);
    return { x1: center, y1: center, x2: end.x, y2: end.y };
  });
  const labels = AXES.map((axis) => {
    const labelRadius = radius * 1.2;
    return {
      x: center + labelRadius * Math.cos(axis.angle) + (axis.labelDx ?? 0),
      y: center + labelRadius * Math.sin(axis.angle),
      label: t(`personalPage.analysis.radar.${axis.i18nKey}`, axis.defaultLabel),
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {gridLevels.map((level, index) => (
          <Circle
            key={`grid-${level}`}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={index === gridLevels.length - 1 ? 1.5 : 1}
            opacity={index === gridLevels.length - 1 ? 0.4 : 0.25}
          />
        ))}

        {axisLines.map((line, index) => (
          <Line
            key={`axis-${index}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={theme.colors.border}
            strokeWidth={1}
            opacity={0.25}
          />
        ))}

        <Polygon
          points={pointsString}
          fill={theme.colors.neonGreen}
          fillOpacity={0.25}
          stroke={theme.colors.neonGreen}
          strokeWidth={2.5}
        />

        {points.map((point, index) => (
          <G key={`point-${index}`}>
            <Circle cx={point.x} cy={point.y} r={6} fill={theme.colors.neonGreen} opacity={0.3} />
            <Circle cx={point.x} cy={point.y} r={5} fill={theme.colors.neonGreen} />
            <Circle cx={point.x} cy={point.y} r={2} fill={theme.colors.white} opacity={0.8} />
          </G>
        ))}

        {labels.map((item, index) => (
          <G key={`label-${index}`}>
            <Circle cx={item.x} cy={item.y} r={18} fill={theme.colors.background} opacity={0.85} />
            <SvgText
              x={item.x}
              y={item.y}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {item.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default RadarChart;
