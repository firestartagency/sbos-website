import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

/**
 * Generates an SVG path string that traces a pill-shaped rounded rectangle.
 */
function buildPillPath(w, h, r) {
    const cr = Math.min(r, w / 2, h / 2);
    return [
        `M ${w / 2} 0`,
        `L ${w - cr} 0`,
        `A ${cr} ${cr} 0 0 1 ${w} ${cr}`,
        `L ${w} ${h - cr}`,
        `A ${cr} ${cr} 0 0 1 ${w - cr} ${h}`,
        `L ${cr} ${h}`,
        `A ${cr} ${cr} 0 0 1 0 ${h - cr}`,
        `L 0 ${cr}`,
        `A ${cr} ${cr} 0 0 1 ${cr} 0`,
        `Z`,
    ].join(' ');
}

/**
 * Calculate the exact perimeter of a pill shape mathematically.
 */
function pillPerimeter(w, h) {
    const r = Math.min(h / 2, w / 2);
    const straightEdge = Math.max(0, w - 2 * r);
    return 2 * straightEdge + 2 * Math.PI * r;
}

const LERP_FACTOR = 0.08;
const LERP_THRESHOLD = 0.001;

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [navSize, setNavSize] = useState({ w: 0, h: 0 });

    const navRef = useRef(null);
    const progressPathRef = useRef(null);

    // ── rAF + lerp refs ──
    const targetProgress = useRef(0);
    const currentProgress = useRef(0);
    const perimeterRef = useRef(0);  // ← useRef instead of derived value to avoid stale closures
    const rafId = useRef(null);
    const isAnimating = useRef(false);

    // ── The core animation tick — reads perimeterRef (always current) ──
    const tick = useCallback(() => {
        const diff = targetProgress.current - currentProgress.current;

        if (Math.abs(diff) < LERP_THRESHOLD) {
            currentProgress.current = targetProgress.current;
            isAnimating.current = false;
        } else {
            currentProgress.current += diff * LERP_FACTOR;
            rafId.current = requestAnimationFrame(tick);
        }

        // Direct DOM write — reads from ref, never stale
        const p = perimeterRef.current;
        if (progressPathRef.current && p > 0) {
            const offset = p * (1 - currentProgress.current);
            progressPathRef.current.setAttribute('stroke-dashoffset', offset);
        }
    }, []); // ← No dependencies — reads everything from refs

    const startAnimation = useCallback(() => {
        if (!isAnimating.current) {
            isAnimating.current = true;
            rafId.current = requestAnimationFrame(tick);
        }
    }, [tick]);

    // ── Measure the FULL border-box of the nav ──
    useEffect(() => {
        if (!navRef.current) return;

        const measure = () => {
            if (!navRef.current) return;
            const rect = navRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setNavSize({ w: rect.width, h: rect.height });
            }
        };

        measure();
        const delayId = setTimeout(measure, 1200);

        const observer = new ResizeObserver(() => measure());
        observer.observe(navRef.current);
        window.addEventListener('resize', measure);

        return () => {
            clearTimeout(delayId);
            observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    // ── Update perimeterRef and SVG dasharray when navSize changes ──
    useEffect(() => {
        if (navSize.w > 0 && navSize.h > 0) {
            const p = pillPerimeter(navSize.w, navSize.h);
            perimeterRef.current = p;

            if (progressPathRef.current) {
                progressPathRef.current.setAttribute('stroke-dasharray', p);
                progressPathRef.current.setAttribute(
                    'stroke-dashoffset',
                    p * (1 - currentProgress.current)
                );
            }
        }
    }, [navSize]);

    // ── Scroll listener ──
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setIsScrolled(y > 20);

            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;

            targetProgress.current = progress;
            startAnimation();
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [startAnimation]);

    // ── GSAP entrance ──
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(navRef.current, {
                y: -100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
                delay: 0.1,
            });
        }, navRef);
        return () => ctx.revert();
    }, []);

    const navLinks = [
        { name: 'Demo Modules', href: '#demo' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Who It\u2019s For', href: '#fit-check' },
        { name: 'Security', href: '#security' },
        { name: 'FAQ', href: '#faq' },
    ];

    const pillD = navSize.w > 0 ? buildPillPath(navSize.w, navSize.h, navSize.h / 2) : '';

    return (
        <nav
            ref={navRef}
            style={{ top: '1.75rem' }}
            className={`fixed left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl rounded-full py-3.5 px-6 transition-[background-color,box-shadow,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-xl shadow-sbos-navy/8 border border-transparent'
                    : 'bg-transparent border border-transparent'
                }`}
        >
            {/* ── Animated scroll-progress pill border ── */}
            <svg
                className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}
                viewBox={navSize.w > 0 ? `0 0 ${navSize.w} ${navSize.h}` : '0 0 100 50'}
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible' }}
            >
                {pillD && (
                    <>
                        {/* Ghost track */}
                        <path
                            d={pillD}
                            stroke="#3366FF"
                            strokeWidth="2"
                            strokeOpacity="0.12"
                        />
                        {/* Progress stroke */}
                        <path
                            ref={progressPathRef}
                            d={pillD}
                            stroke="#3366FF"
                            strokeWidth="3"
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 3px rgba(51,102,255,0.3))' }}
                        />
                    </>
                )}
            </svg>

            {/* ── Inner content ── */}
            <div className="flex items-center justify-between relative z-10">
                <a href="#" className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-sbos-electric rounded-md">
                    <img
                        src="https://res.cloudinary.com/dbtuwhauh/image/upload/v1771843214/SBOS_Logo_For_Website_oi6aqp.png"
                        alt="SBOS"
                        className="h-7 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                </a>

                <div className="hidden lg:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-semibold text-sbos-navy/90 hover:text-sbos-electric transition-all duration-300 hover:-translate-y-[1px] focus:outline-none focus-visible:text-sbos-electric"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-4">
                    <a
                        href="#fit-check"
                        className="text-sm font-semibold text-sbos-navy/90 hover:text-sbos-electric transition-all duration-300 hover:-translate-y-[1px] focus:outline-none focus-visible:text-sbos-electric"
                    >
                        Take Fit Check
                    </a>
                    <button className="bg-sbos-royal hover:bg-sbos-electric text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.03] hover:shadow-lg hover:shadow-sbos-electric/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sbos-electric focus-visible:ring-offset-2">
                        Book a Demo
                    </button>
                </div>

                <button
                    className="lg:hidden p-2 text-sbos-navy/90 hover:text-sbos-electric transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sbos-electric rounded-md"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-sbos-electric/10 rounded-2xl shadow-xl overflow-hidden lg:hidden flex flex-col origin-top transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${mobileMenuOpen ? 'scale-y-100 opacity-100 p-4 gap-4' : 'scale-y-0 opacity-0 h-0 p-0'}`}>
                {navLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        className="text-base font-semibold text-sbos-navy/90 hover:text-sbos-electric px-3 py-2 rounded-lg hover:bg-sbos-ice transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        {link.name}
                    </a>
                ))}
                <div className="h-px w-full bg-sbos-electric/10 my-1" />
                <a
                    href="#fit-check"
                    className="text-base font-semibold text-sbos-navy/90 hover:text-sbos-electric px-3 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    Take Fit Check
                </a>
                <button className="w-full bg-sbos-royal hover:bg-sbos-electric text-white px-6 py-3 mt-2 rounded-xl text-base font-semibold transition-transform duration-300 active:scale-95">
                    Book a Demo
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
