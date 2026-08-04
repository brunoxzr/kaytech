import { useRef, useEffect, useState } from 'react';

interface UseScrollFramesOptions {
    frameCount: number;
    framePath: (index: number) => string;
    /** Identifies the active frame set (e.g. 'desktop' | 'mobile') — changing it forces a reload. */
    variantKey: string;
}

export function useScrollFrames({ frameCount, framePath, variantKey }: UseScrollFramesOptions) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef<number>(-1);
    const rafIdRef = useRef<number | null>(null);
    const targetFrameFloatRef = useRef<number>(0);
    const displayedFrameFloatRef = useRef<number>(0);
    const loopIdRef = useRef<number | null>(null);

    const [isReady, setIsReady] = useState<boolean>(false);
    const [isVideoEnded, setIsVideoEnded] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    // Preload all frames — the scroll-scrubbed hero is the site's core visual signature,
    // so it always renders regardless of the OS "reduce motion" preference.
    useEffect(() => {
        if (frameCount <= 0) return;

        let cancelled = false;
        let loadedCount = 0;
        const images: HTMLImageElement[] = new Array(frameCount);

        // Reset so the previous variant's frame isn't shown while the new set loads
        setIsReady(false);
        currentFrameRef.current = -1;
        displayedFrameFloatRef.current = 0;

        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = framePath(i);
            img.onload = () => {
                if (cancelled) return;
                loadedCount++;
                // Draw as soon as the first frame is available so paint isn't blocked
                if (i === 0) drawFrame(0, true);
                if (loadedCount === frameCount) setIsReady(true);
            };
            images[i] = img;
        }

        imagesRef.current = images;

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frameCount, variantKey]);

    const drawFrame = (index: number, force = false) => {
        const canvas = canvasRef.current;
        const img = imagesRef.current[index];
        if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
        if (!force && currentFrameRef.current === index) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Size the backing buffer to the element's actual on-screen box (device-pixel aware)
        // so we can emulate object-fit: cover ourselves — CSS object-fit does not apply to <canvas>.
        const dpr = window.devicePixelRatio || 1;
        const boxWidth = canvas.clientWidth || window.innerWidth;
        const boxHeight = canvas.clientHeight || window.innerHeight;
        const targetWidth = Math.round(boxWidth * dpr);
        const targetHeight = Math.round(boxHeight * dpr);

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cover-fit math: scale image to fill the canvas box entirely, cropping overflow, centered
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const drawWidth = img.naturalWidth * scale;
        const drawHeight = img.naturalHeight * scale;
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        currentFrameRef.current = index;
    };

    // Keep the canvas backing buffer in sync with its actual rendered box at all times —
    // avoids stale/zero dimensions from being baked in before layout settles.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(() => {
            drawFrame(Math.max(0, currentFrameRef.current), true);
        });
        observer.observe(canvas);

        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || frameCount <= 0) return;

        const updateTarget = () => {
            const rect = container.getBoundingClientRect();
            const totalScrollable = container.scrollHeight - window.innerHeight;
            if (totalScrollable <= 0) return;

            const currentScroll = Math.max(0, -rect.top);
            const scrollRatio = Math.min(1, Math.max(0, currentScroll / totalScrollable));

            setProgress(scrollRatio);
            targetFrameFloatRef.current = scrollRatio * (frameCount - 1);
            setIsVideoEnded(scrollRatio >= 0.98);
        };

        const onScroll = () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(updateTarget);
        };

        // Continuous easing loop: glides the displayed frame toward the scroll-driven
        // target frame each tick instead of snapping, so motion reads as fluid, not stepped.
        const EASE = 0.08;
        const tick = () => {
            const target = targetFrameFloatRef.current;
            const current = displayedFrameFloatRef.current;
            const next = current + (target - current) * EASE;
            displayedFrameFloatRef.current = Math.abs(target - next) < 0.05 ? target : next;

            const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(displayedFrameFloatRef.current)));
            drawFrame(frameIndex);

            loopIdRef.current = requestAnimationFrame(tick);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        updateTarget();
        loopIdRef.current = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (loopIdRef.current) cancelAnimationFrame(loopIdRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frameCount]);

    return {
        canvasRef,
        containerRef,
        isVideoEnded,
        progress,
        isReady,
    };
}
