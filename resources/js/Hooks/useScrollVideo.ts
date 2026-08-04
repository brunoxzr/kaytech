import { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export function useScrollVideo(videoSrc: string) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isVideoEnded, setIsVideoEnded] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [isReady, setIsReady] = useState<boolean>(false);
    const prefersReducedMotion = useReducedMotion();
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;

        if (!video || !container || prefersReducedMotion) return;

        setIsReady(false);
        let duration = 0;

        const handleMetadata = () => {
            duration = video.duration || 0;
            video.pause();
            setIsReady(true);
        };

        if (video.readyState >= 1) {
            handleMetadata();
        } else {
            video.addEventListener('loadedmetadata', handleMetadata);
        }

        const updatePlayhead = () => {
            if (!container || !video || duration <= 0) return;

            const rect = container.getBoundingClientRect();
            const totalScrollable = container.scrollHeight - window.innerHeight;

            if (totalScrollable <= 0) return;

            // Distance scrolled within the 100vh sticky hero container
            const currentScroll = Math.max(0, -rect.top);
            const scrollRatio = Math.min(1, Math.max(0, currentScroll / totalScrollable));

            setProgress(scrollRatio);

            const targetTime = scrollRatio * duration;

            if (Math.abs(video.currentTime - targetTime) > 0.03) {
                video.currentTime = targetTime;
            }

            if (scrollRatio >= 0.98) {
                setIsVideoEnded(true);
            } else {
                setIsVideoEnded(false);
            }
        };

        const onScroll = () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
            rafIdRef.current = requestAnimationFrame(updatePlayhead);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updatePlayhead();

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (video) {
                video.removeEventListener('loadedmetadata', handleMetadata);
            }
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [videoSrc, prefersReducedMotion]);

    return {
        videoRef,
        containerRef,
        isVideoEnded,
        progress,
        prefersReducedMotion,
        isReady,
    };
}
