import { useMemo } from 'react';
import type { SeverityLevel } from '../types/scan';

const severityTokens: Record<
  SeverityLevel,
  {
    label: string;
    color: string;
    soft: string;
    gradient: string;
    glow: string;
  }
> = {
  critical: {
    label: 'Critical',
    color: '#ef4444',
    soft: 'rgba(239, 68, 68, 0.1)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    glow: 'shadow-glow-critical-dark',
  },
  high: {
    label: 'High',
    color: '#f97316',
    soft: 'rgba(249, 115, 22, 0.1)',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    glow: 'shadow-glow-high-dark',
  },
  medium: {
    label: 'Medium',
    color: '#eab308',
    soft: 'rgba(234, 179, 8, 0.1)',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    glow: 'shadow-glow-medium-dark',
  },
  low: {
    label: 'Low',
    color: '#3b82f6',
    soft: 'rgba(59, 130, 246, 0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    glow: 'shadow-glow-low-dark',
  },
  info: {
    label: 'Info',
    color: '#64748b',
    soft: 'rgba(100, 116, 139, 0.1)',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    glow: '',
  },
};

const toolPalette = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#f97316', // orange
  '#10b981', // green
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
];

export const useChartColors = () =>
  useMemo(
    () => ({
      severityTokens,
      toolPalette,
      severityOrder: ['critical', 'high', 'medium', 'low', 'info'] as SeverityLevel[],
    }),
    [],
  );
