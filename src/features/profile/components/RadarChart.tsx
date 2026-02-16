import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Polygon,
  Circle,
  Line,
  Text as SvgText,
  G,
} from "react-native-svg";
import { useTheme } from "@/shared/theme";

// BE response format
interface BackendRadarData {
  form: number; // -1 to 1
  winRate: number; // 0 to 1
  avgStar: number; // 0 to 5
  sentiment: number; // 0 to 1
  trust: number; // 0 to 100
  contribution: number; // 0 to 1
}

// FE display format (all values 0-100)
interface RadarChartData {
  form: number;
  winRate: number;
  feedback: number;
  sentiment: number;
  trust: number;
  contribution: number;
}

interface RadarChartProps {
  data?: BackendRadarData; // Optional to allow mock data
  size?: number;
}

// Mock data for development (when BE is not available)
const MOCK_DATA: BackendRadarData = {
  form: 0.35,
  winRate: 0.75,
  avgStar: 4.3,
  sentiment: 0.68,
  trust: 87,
  contribution: 0.6,
};

// Transform BE data to FE display format
const transformRadarData = (
  data: Partial<BackendRadarData>,
): RadarChartData => {
  // Helper to safely process number
  const safeNum = (val: number | undefined | null, fallback = 0) => {
    return typeof val === "number" && !isNaN(val) ? val : fallback;
  };

  return {
    form: ((safeNum(data.form) + 1) / 2) * 100,
    winRate: safeNum(data.winRate) * 100,
    feedback: (safeNum(data.avgStar) / 5) * 100,
    sentiment: safeNum(data.sentiment) * 100,
    trust: safeNum(data.trust),
    contribution: safeNum(data.contribution) * 100,
  };
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_SIZE = Math.min(SCREEN_WIDTH - 64, 320);
const MAX_VALUE = 100;

// Regular hexagon - 6 axes equally spaced (60 degrees apart)
// Starting from top (-π/2) and going clockwise
const ANGLE_STEP = (2 * Math.PI) / 6; // 60 degrees = π/3
const START_ANGLE = -Math.PI / 2; // Start from top

const AXES = [
  { label: "Form", key: "form", angle: START_ANGLE }, // Top
  { label: "WinRate", key: "winRate", angle: START_ANGLE + ANGLE_STEP }, // Top-right
  { label: "Feedback", key: "feedback", angle: START_ANGLE + 2 * ANGLE_STEP }, // Bottom-right
  { label: "Sentiment", key: "sentiment", angle: START_ANGLE + 3 * ANGLE_STEP }, // Bottom
  { label: "Trust", key: "trust", angle: START_ANGLE + 4 * ANGLE_STEP }, // Bottom-left
  {
    label: "Contribution",
    key: "contribution",
    angle: START_ANGLE + 5 * ANGLE_STEP,
  }, // Top-left
];

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = CHART_SIZE,
}) => {
  const { theme } = useTheme();
  const center = size / 2;
  const radius = size * 0.38; // Slightly larger radius for better visual

  // Use mock data if no data provided, then transform to display format
  const backendData = data || MOCK_DATA;
  const radarData = transformRadarData(backendData);

  // Convert data to points (using standard polar to cartesian conversion)
  const getPoint = (angle: number, value: number) => {
    // Clamp value between 0 and MAX_VALUE to prevent chart overflow
    const clampedValue = Math.max(0, Math.min(value, MAX_VALUE));
    const normalizedValue = clampedValue / MAX_VALUE;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points in correct order
  const points = AXES.map((axis) => {
    const value = radarData[axis.key as keyof RadarChartData];
    return getPoint(axis.angle, value);
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Generate grid circles (5 levels for better granularity)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridCircles = gridLevels.map((level) => ({
    r: radius * level,
    cx: center,
    cy: center,
  }));

  // Generate axis lines
  const axisLines = AXES.map((axis) => {
    const point = getPoint(axis.angle, MAX_VALUE);
    return {
      x1: center,
      y1: center,
      x2: point.x,
      y2: point.y,
    };
  });

  // Generate label positions with better spacing
  const labelPositions = AXES.map((axis) => {
    const labelRadius = radius * 1.2; // Increased spacing for labels
    const x = center + labelRadius * Math.cos(axis.angle);
    const y = center + labelRadius * Math.sin(axis.angle);
    return { x, y, label: axis.label, angle: axis.angle };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle for depth */}
        <Circle
          cx={center}
          cy={center}
          r={radius * 1.05}
          fill="none"
          stroke={theme.colors.border}
          strokeWidth={1}
          opacity={0.1}
        />

        {/* Grid circles - more subtle */}
        {gridCircles.map((circle, index) => (
          <Circle
            key={`circle-${index}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={index === gridCircles.length - 1 ? 1.5 : 1}
            opacity={index === gridCircles.length - 1 ? 0.4 : 0.25}
          />
        ))}

        {/* Axis lines - more subtle */}
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

        {/* Data polygon with gradient effect */}
        <Polygon
          points={pointsString}
          fill={theme.colors.neonGreen}
          fillOpacity={0.25}
          stroke={theme.colors.neonGreen}
          strokeWidth={2.5}
        />

        {/* Data points with glow effect */}
        {points.map((point, index) => (
          <G key={`point-${index}`}>
            {/* Outer glow circle */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill={theme.colors.neonGreen}
              opacity={0.3}
            />
            {/* Main point */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={5}
              fill={theme.colors.neonGreen}
            />
            {/* Inner highlight */}
            <Circle
              cx={point.x}
              cy={point.y}
              r={2}
              fill={theme.colors.white}
              opacity={0.8}
            />
          </G>
        ))}

        {/* Labels with background for better readability */}
        {labelPositions.map((pos, index) => (
          <G key={`label-${index}`}>
            {/* Background circle for label */}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill={theme.colors.background}
              opacity={0.8}
            />
            {/* Label text */}
            <SvgText
              x={pos.x}
              y={pos.y}
              fill={theme.colors.text}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {pos.label}
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
