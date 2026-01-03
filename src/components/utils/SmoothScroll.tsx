
import { useEffect } from "react";
import Lenis from "lenis";

export const SmoothScroll = () => {
    useEffect(() => {
        // Detect if the device is a touch device or has a coarse pointer (mobile/tablet)
        const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

        // If it's a touch device, do not initialize Lenis. Native scrolling is better for mobile.
        if (isTouchDevice) return;

        // Initialize Lenis for desktop
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        // Request Animation Frame loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        const rafId = requestAnimationFrame(raf);

        // Cleanup
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return null;
};
