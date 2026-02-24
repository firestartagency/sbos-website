import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PlayCircle, CheckCircle2, AlertTriangle, FileText, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import CalendlyModal from './CalendlyModal';

const Hero = () => {
    const sectionRef = useRef(null);
    const leftContentRef = useRef(null);
    const rightCompositionRef = useRef(null);
    const [bookingOpen, setBookingOpen] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Timeline for coordinated entrance
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            // Left content fade up
            tl.from(leftContentRef.current.children, {
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                delay: 0.2
            });

            // Right composition floating cards — use fromTo for guaranteed end state
            tl.fromTo('.ui-card',
                {
                    y: 60,
                    opacity: 0,
                    rotateX: -15,
                },
                {
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    duration: 1,
                    stagger: 0.15,
                    clearProps: 'transform',
                },
                "-=0.6"
            );

            // Continuous floating animation (starts after entrance completes)
            tl.add(() => {
                gsap.to('.ui-card', {
                    y: '-=10',
                    duration: 3,
                    ease: 'sine.inOut',
                    yoyo: true,
                    repeat: -1,
                    stagger: {
                        each: 0.2,
                        from: 'random'
                    }
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative min-h-[100dvh] pt-32 pb-20 flex items-center overflow-hidden">
            {/* Background radial gradient accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sbos-electric/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Left: Copy + CTA */}
                <div ref={leftContentRef} className="flex flex-col gap-6 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="flex h-2 w-2 rounded-full bg-sbos-electric relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sbos-electric opacity-75"></span>
                        </span>
                        <p className="text-sm font-mono text-sbos-electric font-medium tracking-wide">
                            SBOS Demo • Small Business Operating System
                        </p>
                    </div>

                    <h1 className="text-5xl lg:text-6xl/tight font-heading font-bold text-sbos-navy tracking-tight text-balance">
                        Stop guessing about your business health. <br />
                        <span className="font-accent italic font-normal text-sbos-royal">Start executing with clarity.</span>
                    </h1>

                    <p className="text-lg text-sbos-slate font-body text-balance leading-relaxed">
                        Diagnostic insights, money leak detection, and ready-to-use SOPs for local service businesses. Turn scattered operations into a clear execution system in minutes.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                        <button onClick={() => setBookingOpen(true)} className="bg-sbos-royal hover:bg-sbos-electric text-white px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.03] hover:shadow-xl hover:-translate-y-1 hover:shadow-sbos-electric/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-sbos-electric focus-visible:ring-offset-2">
                            Book a Demo
                        </button>
                        <a href="#how-it-works" className="flex items-center gap-2 group bg-white border border-sbos-slate/20 hover:border-sbos-electric text-sbos-navy px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:shadow-sm hover:scale-[1.03]">
                            <PlayCircle size={20} className="text-sbos-royal group-hover:text-sbos-electric transition-colors" />
                            See Demo Flow
                        </a>
                    </div>

                    {/* Proof Chips */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {[
                            "No login required",
                            "Uses sample business data",
                            "5 modules in one guided flow",
                            "~10 min demo"
                        ].map((chip) => (
                            <div key={chip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sbos-ice/50 border border-sbos-royal/5 text-xs font-mono text-sbos-slate">
                                <CheckCircle2 size={12} className="text-sbos-success" />
                                {chip}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: UI Composition */}
                <div ref={rightCompositionRef} className="relative h-[600px] w-full hidden lg:block" style={{ perspective: '1000px' }}>
                    {/* Center Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full text-sbos-electric/20 stroke-[1.5] stroke-dasharray-4 pointer-events-none" style={{ strokeDasharray: '4 4' }}>
                        <path d="M 150,300 Q 300,100 450,200" fill="none" stroke="currentColor" />
                        <path d="M 150,300 Q 300,500 450,400" fill="none" stroke="currentColor" />
                    </svg>

                    {/* Card 1: Health Score */}
                    <div className="ui-card absolute top-10 left-0 bg-white/90 backdrop-blur-md border border-sbos-slate/10 p-5 rounded-2xl shadow-xl shadow-sbos-navy/5 w-64 transform transition-all duration-300 hover:scale-105 hover:border-sbos-electric/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-sbos-ice text-sbos-royal rounded-lg">
                                <Activity size={20} />
                            </div>
                            <p className="font-mono text-xs font-semibold text-sbos-slate uppercase tracking-wider">Health Score</p>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-heading font-bold text-sbos-navy">72</span>
                            <span className="text-sm text-sbos-slate mb-1">/ 100</span>
                        </div>
                        <div className="w-full h-2 bg-sbos-ice rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-sbos-warning w-[72%] rounded-full"></div>
                        </div>
                    </div>

                    {/* Card 2: Money Leak */}
                    <div className="ui-card absolute top-24 right-4 bg-white/90 backdrop-blur-md border border-sbos-slate/10 p-5 rounded-2xl shadow-xl shadow-sbos-navy/5 w-72 transform transition-all duration-300 hover:scale-105 hover:border-sbos-electric/30">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} className="text-sbos-warning" />
                                <span className="text-sm font-semibold text-sbos-navy">Duplicative Software</span>
                            </div>
                            <span className="text-xs font-mono bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium border border-red-100">Leak found</span>
                        </div>
                        <p className="text-xs text-sbos-slate mt-2 border-t border-sbos-slate/10 pt-2">Potential savings: <span className="font-mono font-semibold text-sbos-navy">$450/mo</span></p>
                    </div>

                    {/* Card 3: 30/60/90 Plan */}
                    <div className="ui-card absolute top-56 left-12 bg-white/90 backdrop-blur-md border border-sbos-slate/10 p-5 rounded-2xl shadow-xl shadow-sbos-navy/5 w-64 transform transition-all duration-300 hover:scale-105 hover:border-sbos-electric/30 z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-sbos-cloud text-sbos-royal border border-sbos-electric/20 rounded-lg">
                                <TrendingUp size={18} />
                            </div>
                            <p className="font-mono text-xs font-semibold text-sbos-navy uppercase tracking-wider">30 Day Action Plan</p>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 bg-sbos-royal/10 border border-sbos-royal/30 rounded inline-flex items-center justify-center shrink-0"></div>
                                <p className="text-xs text-sbos-slate leading-tight">Consolidate team scheduling tools</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 bg-sbos-success text-white rounded inline-flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={12} />
                                </div>
                                <p className="text-xs text-sbos-slate leading-tight line-through opacity-70">Review current SOP inventory</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: SOP Generator */}
                    <div className="ui-card absolute bottom-20 right-10 bg-white/90 backdrop-blur-md border border-sbos-slate/10 p-5 rounded-2xl shadow-xl shadow-sbos-navy/5 w-64 transform transition-all duration-300 hover:scale-105 hover:border-sbos-electric/30">
                        <div className="flex items-center justify-between border-b border-sbos-slate/10 pb-3 mb-3">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-sbos-slate" />
                                <span className="text-sm font-semibold text-sbos-navy">Lead Intake SOP</span>
                            </div>
                            <span className="h-2 w-2 rounded-full bg-sbos-success animate-pulse"></span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-2 bg-sbos-ice rounded w-3/4"></div>
                            <div className="h-2 bg-sbos-ice rounded w-1/2"></div>
                            <div className="h-2 bg-sbos-ice rounded w-5/6"></div>
                        </div>
                        <button className="mt-4 w-full text-xs font-semibold text-sbos-electric hover:text-sbos-royal flex items-center justify-center gap-1 transition-colors">
                            Preview Document <ArrowRight size={12} />
                        </button>
                    </div>

                </div>
            </div>
            <CalendlyModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
        </section>
    );
};

export default Hero;
