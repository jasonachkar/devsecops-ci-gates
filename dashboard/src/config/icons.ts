import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  Shield,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import type { SeverityLevel } from '../types/scan';

export const severityIcons: Record<SeverityLevel, LucideIcon> = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Info,
  info: Info,
};

export const statusIcons = {
  passed: CheckCircle2,
  failed: XCircle,
};

export const sectionIcons = {
  security: Shield,
  tools: Wrench,
  findings: Zap,
};

export const iconMap = {
  ...severityIcons,
  ...statusIcons,
  ...sectionIcons,
};
