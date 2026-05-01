import { useEffect, useRef, useState } from 'react';
export const useFadeIn = () => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (domRef.current)
                        observer.unobserve(domRef.current);
                }
            });
        }, { threshold: 0.15 });
        if (domRef.current) {
            observer.observe(domRef.current);
        }
        return () => {
            if (domRef.current)
                observer.unobserve(domRef.current);
        };
    }, []);
    return { domRef, isVisible };
};
