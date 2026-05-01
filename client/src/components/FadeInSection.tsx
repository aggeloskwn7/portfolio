import React from 'react';
import { useFadeIn } from '@/hooks/use-fade-in';
import { cn } from '@/lib/utils';
interface FadeInSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    staggerChildren?: boolean;
}
export function FadeInSection({ children, className, delay, staggerChildren = false }: FadeInSectionProps) {
    const { domRef, isVisible } = useFadeIn();
    return (<div ref={domRef} className={cn('fade-in-section', isVisible && 'is-visible', staggerChildren && 'stagger-animation', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>);
}
