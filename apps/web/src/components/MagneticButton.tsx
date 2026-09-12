import { motion, type MotionProps } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { MOTION } from '../lib/motion';

type MagneticButtonProps = Omit<MotionProps, 'children'> & {
    children: ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
    to?: string;
};

export function MagneticButton({ children, className = 'studioButton primary', href, onClick, ...props }: MagneticButtonProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const content = (
        <motion.span animate={position} transition={MOTION.spring} {...props}>
            {children}
        </motion.span>
    );

    const handleMove = (event: React.MouseEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({ x: (event.clientX - rect.left - rect.width / 2) * 0.12, y: (event.clientY - rect.top - rect.height / 2) * 0.12 });
    };

    const handleLeave = () => setPosition({ x: 0, y: 0 });

    if (href) {
        return <a className={className} href={href} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}>{content}</a>;
    }

    return <button className={className} type="button" onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}>{content}</button>;
}
