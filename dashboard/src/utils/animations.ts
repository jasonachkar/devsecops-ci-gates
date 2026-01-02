import type { Variants } from 'framer-motion';

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 24,
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export const cardHover: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2 },
  },
};

// Additional variants for components
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 18,
      mass: 0.8,
    },
  },
};

export const hoverScale = {
  scale: 1.02,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
};

export const counterVariants: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 12,
      mass: 0.6,
    },
  },
};

export const progressVariants: Variants = {
  initial: { width: 0, opacity: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    opacity: 1,
    transition: {
      width: {
        type: 'spring',
        stiffness: 80,
        damping: 15,
        mass: 1.2,
      },
      opacity: {
        duration: 0.3,
      },
    },
  }),
};

export const shimmerVariants: Variants = {
  animate: {
    x: ['0%', '100%'],
    transition: {
      repeat: Infinity,
      duration: 1.8,
      ease: 'linear',
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export const pageVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};
