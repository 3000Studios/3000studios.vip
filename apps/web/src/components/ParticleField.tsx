import { useEffect, useState } from 'react';

export function ParticleField({ count = 36 }: { count?: number }) {
    const [particles, setParticles] = useState<Array<{ left: string; top: string; delay: string; size: string }>>([]);

    useEffect(() => {
        setParticles(Array.from({ length: count }, (_, index) => ({
            left: `${(index * 37) % 100}%`,
            top: `${(index * 61) % 100}%`,
            delay: `${(index % 9) * -0.7}s`,
            size: `${2 + (index % 3)}px`,
        })));
    }, [count]);

    return (
        <div className="particleField" aria-hidden="true">
            {particles.map((particle, index) => <i key={index} style={particle} />)}
        </div>
    );
}
