import { motion, type MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { MOTION } from '../lib/motion';

export function ScrollReveal({ children, className, ...props }: MotionProps & { children: ReactNode; className?: string }) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={MOTION.spring}
            {...props}
        >
            {children}
        </motion.div>
    );
}
