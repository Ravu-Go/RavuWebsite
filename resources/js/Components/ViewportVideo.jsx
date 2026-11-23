import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/** Play a muted decorative video only while it is near the viewport. */
export default function ViewportVideo({ className = "", ...props }) {
    const videoRef = useRef(null);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return undefined;

        if (reduceMotion) {
            video.pause();
            return undefined;
        }

        if (typeof IntersectionObserver === "undefined") {
            video.play().catch(() => {});
            return () => video.pause();
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            },
            { rootMargin: "150px 0px", threshold: 0.01 },
        );

        observer.observe(video);
        return () => {
            observer.disconnect();
            video.pause();
        };
    }, [reduceMotion]);

    return (
        <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            className={className}
            {...props}
        />
    );
}
