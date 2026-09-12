import { useMemo, type CSSProperties } from 'react';

export function ParticleField({ count = 36 }: { count?: number }) {
    const particles = useMemo(() => Array.from({ length: count }, (_, index) => ({
        '--particle-left': `${(index * 37) % 100}%`,
        '--particle-top': `${(index * 61) % 100}%`,
        '--particle-delay': `${(index % 9) * -0.7}s`,
        '--particle-size': `${2 + (index % 3)}px`,
    })), [count]);

    return (
        <div className="particleField" aria-hidden="true">
            {particles.map((particle, index) => <i key={index} style={particle as CSSProperties} />)}
        </div>
    );
}
