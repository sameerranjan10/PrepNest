import React from 'react';
import { motion } from 'framer-motion';

export const BLUR_DROP_EASE = [0.16, 1, 0.3, 1];

export function BlurDrop({
  children,
  className = '',
  delay = 0,
  duration = 0.45,
  yOffset = -14,
  blurAmount = 10,
  as = 'div',
  ...rest
}) {
  const MotionTag =
    as === 'main'
      ? motion.main
      : as === 'section'
        ? motion.section
        : motion.div;

  return (
    <MotionTag
      initial={{ opacity: 0, y: yOffset, filter: `blur(${blurAmount}px)` }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transitionEnd: { filter: 'none', transform: 'none' }
      }}
      transition={{ duration, delay, ease: BLUR_DROP_EASE }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

