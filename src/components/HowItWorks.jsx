import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const timelineSteps = [
    { num: '01', title: 'Intake', desc: 'Business basics + bottlenecks.' },
    { num: '02', title: 'Diagnostic', desc: 'Baseline score + operational snapshot.' },
    { num: '03', title: 'Find Leaks', desc: 'Identify software + money waste.' },
    { num: '04', title: 'Roadmap', desc: 'Clear 30/60/90 growth plan.' },
    { num: '05', title: 'SOPs', desc: 'Starter pack generation.' },
    { num: '06', title: 'Automation', desc: 'Follow-up sequence preview.' },
];

const HowItWorks = () => {
    const containerRef = useRef(null);
    const lineRef = useRef(null);

    useEffect(() => {
        // Scroll linked progress line
        const ctx = gsap.context(() => {
            gsap.to(lineRef.current, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
                height: '100%',
                ease: 'none'
            });

            // Step Highlights
            const steps = gsap.utils.toArray('.timeline-step');
            steps.forEach((step, i) => {
                gsap.to(step.querySelector('.step-dot'), {
                    scrollTrigger: {
                        trigger: step,
                        start: 'top center+=100',
                        end: '+=200',
                        toggleClass: 'active-dot',
                    }
                });

                gsap.to(step.querySelector('.step-card'), {
                    scrollTrigger: {
                        trigger: step,
                        start: 'top center+=100',
                        end: '+=200',
                        toggleClass: 'active-card',
                    }
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="how-it-works" className="py-24 bg-sbos-cloud relative overflow-hidden">
            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-30 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                <div className="text-center mb-20">
                    <h2 className="text-4xl font-heading font-bold text-sbos-navy mb-4">What the SBOS demo shows you in ~10 minutes</h2>
                    <p className="text-lg text-sbos-slate font-body">A guided journey from intake to actionable outputs.</p>
                </div>

                <div ref={containerRef} className="relative pl-6 lg:pl-0">

                    {/* Vertical line (Mobile & Desktop) */}
                    <div className="absolute left-[29px] lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-sbos-electric/10 rounded-full"></div>

                    {/* Animated Progress Line */}
                    <div ref={lineRef} className="absolute left-[28px] lg:left-1/2 lg:-translate-x-1/2 top-0 w-1 bg-gradient-to-b from-sbos-electric to-sbos-royal rounded-full shadow-[0_0_10px_rgba(51,102,255,0.5)] h-0 z-0"></div>

                    <div className="flex flex-col gap-12 lg:gap-24 relative z-10">
                        {timelineSteps.map((step, idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                                <div key={idx} className={`timeline-step relative flex flex-col lg:flex-row items-start lg:items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}>

                                    {/* Dot */}
                                    <div className="absolute left-[-21px] lg:left-1/2 lg:-translate-x-1/2 w-6 h-6 rounded-full bg-sbos-cloud border-2 border-sbos-slate/20 step-dot transition-all duration-500 z-10 flex items-center justify-center data-[active=true]:border-sbos-electric data-[active=true]:bg-sbos-electric">
                                        <div className="w-2 h-2 rounded-full bg-sbos-electric inner-dot transition-colors duration-500"></div>
                                    </div>

                                    {/* Card Content */}
                                    <div className={`step-card w-full lg:w-[45%] bg-white p-6 rounded-2xl shadow-sm border border-sbos-slate/10 transition-all duration-500 mt-[-16px] lg:mt-0 lg:ml-0 md:ml-8`}>
                                        <span className="text-xs font-mono font-bold text-sbos-electric mb-2 block tracking-widest">STEP {step.num}</span>
                                        <h4 className="text-xl font-heading font-bold text-sbos-navy mb-2">{step.title}</h4>
                                        <p className="text-sm text-sbos-slate leading-relaxed">{step.desc}</p>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* Global CSS for toggleClass (simulated here via classes) */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .active-dot { border-color: theme('colors.sbos-electric') !important; }
        .active-dot .inner-dot { background-color: theme('colors.sbos-electric') !important; }
        .active-card { 
          border-color: theme('colors.sbos-electric' / 30%) !important; 
          box-shadow: 0 10px 25px -5px theme('colors.sbos-navy' / 5%) !important;
          transform: translateY(-2px);
        }
      `}} />
        </section>
    );
};

export default HowItWorks;
