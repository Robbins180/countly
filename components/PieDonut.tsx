import React, { memo } from "react";
import { View, Text } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";

export type PieSlice = { label: string; value: number; color?: string };

type Props = {
  size?: number;          // outer diameter
  thickness?: number;     // donut thickness
  data: PieSlice[];       // [{label, value, color?}]
  centerLabel?: string;   // text inside the donut
};

// --- small helpers ---
function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArcFlag = end - start <= 180 ? "0" : "1";
  return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${endPt.x} ${endPt.y}`;
}

// --- main component ---
const PieDonut = memo(({ size = 220, thickness = 28, data, centerLabel }: Props) => {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  const radius = size / 2;
  const innerR = radius - thickness;

  let cursor = 0;
  const slices = total > 0 ? data.map((d, i) => {
    const pct = (d.value / total) * 100;
    const sweep = (pct / 100) * 360;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;

    // soft color palette
    const fallback = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#A855F7"][i % 6];
    return { ...d, start, end, color: d.color || fallback };
  }) : [];

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <G origin={`${radius}, ${radius}`}>
          {/* base ring */}
          <Circle
            cx={radius}
            cy={radius}
            r={radius - thickness / 2}
            strokeWidth={thickness}
            stroke="#E5E7EB"
            fill="none"
          />
          {/* slices */}
          {slices.map((s, i) => {
            const outerArc = describeArc(radius, radius, radius - thickness / 2, s.start, s.end);
            const innerArc = describeArc(radius, radius, innerR + thickness / 2, s.end, s.start);
            const d = `${outerArc} L ${polarToCartesian(radius, radius, innerR + thickness / 2, s.start).x} ${polarToCartesian(radius, radius, innerR + thickness / 2, s.start).y} ${innerArc} Z`;
            return <Path key={i} d={d} fill={s.color} />;
          })}
        </G>
      </Svg>

      {!!centerLabel && (
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }}>{centerLabel}</Text>
          {total > 0 && (
            <Text style={{ fontSize: 12, color: "#6B7280" }}>{total} total</Text>
          )}
        </View>
      )}
    </View>
  );
});

export default PieDonut;
