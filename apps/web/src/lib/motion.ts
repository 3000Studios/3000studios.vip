import type { Transition } from 'framer-motion';

export const MOTION = {
    spring: { type: 'spring', stiffness: 300, damping: 30, mass: 1 } satisfies Transition,
    bounce: { type: 'spring', stiffness: 400, damping: 10 } satisfies Transition,
    float: { type: 'spring', stiffness: 80, damping: 20 } satisfies Transition,
    snappy: { type: 'spring', stiffness: 600, damping: 25 } satisfies Transition,
    curves: {
        easeOutQuad: [0.25, 0.46, 0.45, 0.94] as const,
        easeInOutCirc: [0.6, 0.04, 0.98, 0.33] as const,
        smooth: [0.25, 0.46, 0.45, 0.94] as const,
    },
    durations: {
        instant: 0.15,
        fast: 0.3,
        normal: 0.5,
        slow: 0.8,
        verySlow: 1.2,
    },
} as const;
