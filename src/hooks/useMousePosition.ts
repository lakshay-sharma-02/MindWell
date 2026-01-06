import { useState, useEffect, useRef, useCallback } from "react";

export const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const requestRef = useRef<number>();
    const positionRef = useRef({ x: 0, y: 0 });

    const updateMousePosition = useCallback(() => {
        setMousePosition({ ...positionRef.current });
        requestRef.current = undefined;
    }, []);

    useEffect(() => {
        const handleMouseMove = (ev: MouseEvent) => {
            positionRef.current = { x: ev.clientX, y: ev.clientY };
            if (!requestRef.current) {
                requestRef.current = requestAnimationFrame(updateMousePosition);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [updateMousePosition]);

    return mousePosition;
};
