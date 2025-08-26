/**
 * Lenis Smooth Scrolling Hook
 * Custom hook for integrating Lenis smooth scrolling with React
 * Day 1 of 365 Days Challenge
 */

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

/**
 * Custom hook for Lenis smooth scrolling
 * @param {Object} options - Lenis configuration options
 * @returns {Object} - Lenis instance and utility functions
 */
export const useLenis = (options = {}) => {
    const lenisRef = useRef(null);
    const rafRef = useRef(null);

    const defaultOptions = {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
        ...options
    };

    useEffect(() => {
        // Initialize Lenis
        lenisRef.current = new Lenis(defaultOptions);

        // RAF loop for smooth scrolling
        const raf = (time) => {
            lenisRef.current.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        };

        rafRef.current = requestAnimationFrame(raf);

        // Cleanup function
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
            }
        };
    }, []);

    // Scroll to element function
    const scrollTo = (target, options = {}) => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(target, {
                offset: 0,
                duration: defaultOptions.duration,
                easing: defaultOptions.easing,
                ...options
            });
        }
    };

    // Scroll to top function
    const scrollToTop = (options = {}) => {
        scrollTo(0, options);
    };

    // Start scrolling
    const start = () => {
        if (lenisRef.current) {
            lenisRef.current.start();
        }
    };

    // Stop scrolling
    const stop = () => {
        if (lenisRef.current) {
            lenisRef.current.stop();
        }
    };

    // Get current scroll position
    const getScroll = () => {
        return lenisRef.current ? lenisRef.current.scroll : 0;
    };

    // Add scroll event listener
    const on = (event, callback) => {
        if (lenisRef.current) {
            lenisRef.current.on(event, callback);
        }
    };

    // Remove scroll event listener
    const off = (event, callback) => {
        if (lenisRef.current) {
            lenisRef.current.off(event, callback);
        }
    };

    return {
        lenis: lenisRef.current,
        scrollTo,
        scrollToTop,
        start,
        stop,
        getScroll,
        on,
        off
    };
};

/**
 * Higher-order component that adds Lenis smooth scrolling
 * @param {React.Component} WrappedComponent 
 * @param {Object} lenisOptions 
 * @returns {React.Component}
 */
export const withLenis = (WrappedComponent, lenisOptions = {}) => {
    return function WithLenisComponent(props) {
        const lenis = useLenis(lenisOptions);
        
        return <WrappedComponent {...props} lenis={lenis} />;
    };
};

/**
 * Utility function to create smooth scroll anchors
 * @param {string} targetId - ID of the target element
 * @param {Object} options - Scroll options
 * @returns {Function} - Click handler function
 */
export const createScrollAnchor = (targetId, options = {}) => {
    return (event) => {
        event.preventDefault();
        
        const target = document.getElementById(targetId);
        if (target && window.lenis) {
            window.lenis.scrollTo(target, options);
        }
    };
};
