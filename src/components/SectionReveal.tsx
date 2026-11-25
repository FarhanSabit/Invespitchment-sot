import React from 'react';
import { motion, Variants } from 'motion/react';

export const INSTITUTIONAL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const sectionContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: (custom?: { delay?: number; stagger?: number }) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: custom?.delay ?? 0.04,
      ease: INSTITUTIONAL_EASE,
      when: 'beforeChildren',
      staggerChildren: custom?.stagger ?? 0.09,
      delayChildren: 0.06,
    },
  }),
};

export const sectionItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: INSTITUTIONAL_EASE,
    },
  },
};

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Render immediately on mount (used for above-the-fold Hero section) */
  immediate?: boolean;
  /** Subtle progressive entrance delay offset in seconds */
  delay?: number;
  /** Stagger interval for child motion items in seconds */
  stagger?: number;
}

export const SectionReveal: React.FC<SectionRevealProps> = ({
  children,
  className = '',
  immediate = false,
  delay = 0.04,
  stagger = 0.09,
}) => {
  if (immediate) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={sectionContainerVariants}
        custom={{ delay, stagger }}
        className={`section-reveal ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.04, margin: '-32px 0px' }}
      variants={sectionContainerVariants}
      custom={{ delay, stagger }}
      className={`section-reveal ${className}`}
    >
      {children}
    </motion.div>
  );
};
