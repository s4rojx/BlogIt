import React, { useMemo } from 'react';
import '../styles/BackgroundAnimation.css';

const BackgroundAnimation = () => {
    // Generate tiny particles for the "dust" look
    const particles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 4 + 2}px`, // 2px to 6px
            duration: `${Math.random() * 40 + 30}s`, // Slow float
            delay: `${Math.random() * -60}s`
        }));
    }, []);

    return (
        <div className="background-animation">
            <div className="background-gradient" />
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDuration: p.duration,
                        animationDelay: p.delay
                    }}
                />
            ))}
        </div>
    );
};

export default BackgroundAnimation;
