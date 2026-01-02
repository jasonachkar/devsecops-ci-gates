export interface SparklinePoint {
  index: number;
  value: number;
}

export const generateTrendData = (value: number, points = 12): SparklinePoint[] => {
  if (value <= 0) {
    return Array.from({ length: points }, (_, index) => ({ index, value: 0 }));
  }

  const base = Math.max(value, 1);
  const midpoint = Math.max(points - 1, 1);

  return Array.from({ length: points }, (_, index) => {
    const progress = index / midpoint;
    const wave = Math.sin((index + 1) * 0.7 + value) * 0.18;
    const wobble = ((index % 4) - 1.5) * 0.06;
    const scaled = base * (0.55 + progress * 0.45 + wave + wobble);
    return { index, value: Math.max(0, Math.round(scaled)) };
  });
};
