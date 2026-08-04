import React from 'react';
import { useScrollFrames } from '../../Hooks/useScrollFrames';
import { useMediaQuery } from '../../Hooks/useMediaQuery';
import { HeroReveal } from './HeroReveal';

interface ScrollControlledHeroProps {
    onVideoEndChange?: (ended: boolean) => void;
}

const DESKTOP_FRAME_COUNT = 501;
const MOBILE_FRAME_COUNT = 501;

const pad4 = (n: number) => String(n + 1).padStart(4, '0');

export const ScrollControlledHero: React.FC<ScrollControlledHeroProps> = ({ onVideoEndChange }) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const frameCount = isDesktop ? DESKTOP_FRAME_COUNT : MOBILE_FRAME_COUNT;
    const framePath = isDesktop
        ? (i: number) => `/frames/desktop/frame-${pad4(i)}.jpg`
        : (i: number) => `/frames/mobile/frame-${pad4(i)}.jpg`;

    const { canvasRef, containerRef, isVideoEnded, progress, isReady } = useScrollFrames({
        frameCount,
        framePath,
        variantKey: isDesktop ? 'desktop' : 'mobile',
    });

    // Reserve the tail of the scroll range (progress 0.90 -> 1.0) for the title/CTA text
    // to fade in over the darkened last frame, before the rest of the page unlocks.
    const TEXT_START = 0.9;
    const textOpacity = Math.min(1, Math.max(0, (progress - TEXT_START) / (1 - TEXT_START)));

    React.useEffect(() => {
        if (onVideoEndChange) {
            onVideoEndChange(isVideoEnded);
        }
    }, [isVideoEnded, onVideoEndChange]);

    return (
        /* The container height is 700vh: more scroll distance per frame keeps the sequence slow and fluid */
        <div ref={containerRef} className="relative w-full h-[700vh] bg-[#050505]">
            <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#050505]">
                {/*
                  30fps frame-sequence scrubber rendered to canvas, driven entirely by scroll position.
                  No text, buttons or navbar overlaying it — until the very end, when the frame is
                  fully dark and the title/CTA fade in on top of it (see TEXT_START above).
                */}
                <canvas
                    ref={canvasRef}
                    className="w-full h-full pointer-events-none transition-opacity duration-300"
                    style={{
                        display: 'block',
                        backgroundColor: '#050505',
                        opacity: progress >= 0.98 ? 0.05 : 1,
                    }}
                />

                {/* Slight darkening overlay for depth, without hiding the footage */}
                <div className="absolute inset-0 bg-black/15 pointer-events-none" />

                {/* Loading state: black background + centered logo until frames are ready to scrub */}
                <div
                    className="absolute inset-0 flex items-center justify-center bg-[#050505] pointer-events-none transition-opacity duration-700 ease-out"
                    style={{ opacity: isReady ? 0 : 1 }}
                >
                    <img
                        src="/images/logo-kaytech.png"
                        alt="KayTech"
                        className="h-12 md:h-16 object-contain"
                    />
                </div>

                <HeroReveal opacity={textOpacity} />
            </div>
        </div>
    );
};
