import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { pageTransition } from '../../utils/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.main
      className={className}
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {children}
    </motion.main>
  );
}
