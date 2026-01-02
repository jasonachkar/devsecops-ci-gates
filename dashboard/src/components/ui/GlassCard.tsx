import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cardHover } from '../../utils/animations';

type GlowLevel = 'critical' | 'high' | 'medium' | 'low';
type Elevation = 'sm' | 'md' | 'lg';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  glow?: GlowLevel;
  elevation?: Elevation;
  hover?: boolean;
}

const glowClasses: Record<GlowLevel, string> = {
  critical: 'shadow-glow-critical',
  high: 'shadow-glow-high',
  medium: 'shadow-glow-medium',
  low: 'shadow-glow-low',
};

const elevationClasses: Record<Elevation, string> = {
  sm: 'shadow-glass',
  md: 'shadow-glass',
  lg: 'shadow-glass-lg',
};

export function GlassCard({
  children,
  className,
  containerClassName,
  glow,
  elevation = 'md',
  hover = true,
}: GlassCardProps) {
  const cardClasses = [
    'relative rounded-[16px] glass-panel',
    elevationClasses[elevation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className={['relative', containerClassName].filter(Boolean).join(' ')}
      {...(hover
        ? {
            variants: cardHover,
            initial: 'rest',
            animate: 'rest',
            whileHover: 'hover',
          }
        : {})}
    >
      {glow ? (
        <span
          className={[
            'pointer-events-none absolute -inset-1 rounded-[24px] opacity-70',
            glowClasses[glow],
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ) : null}
      <div className={cardClasses}>{children}</div>
    </motion.div>
  );
}
