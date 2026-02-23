import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Activity, AlertTriangle, TrendingUp, FileText, ArrowRightCircle } from 'lucide-react';

const modules = [
    { icon: Activity, label: "Business Health Diagnostic" },
    { icon: AlertTriangle, label: "Money Leak Finder" },
    { icon: TrendingUp, label: "Growth Plan Generator" },
    { icon: FileText, label: "SOP Builder" },
    { icon: ArrowRightCircle, label: "Lead Flow Automation" }
];

const WhatIsSbos = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(containerRef.current.children, {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 85%',
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });

            gsap.from('.definition-chip', {
                scrollTrigger: {
                    trigger: '.chips-container',
                    start: 'top 85%',
                },
                scale: 0.9,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'back.out(1.5)'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section className="bg-sbos-navy text-white py-20 relative overflow-hidden">
            {/* Blueprint Grid Overlay for Dark Section */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]" />

            <div ref={containerRef} className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
                <h2 className="text-3xl md:text-4xl font-heading font-medium tracking-tight mb-8">
                    What SBOS actually does <span className="text-sbos-electric font-accent italic">(in plain English)</span>
                </h2>

                <p className="text-lg md:text-xl text-sbos-ice/90 font-body text-balance max-w-3xl leading-relaxed mb-12">
                    SBOS is an operating system that helps small businesses assess their current operations, reduce wasted spend, create a 30/60/90 day plan, document repeatable processes, and automate basic follow-up without needing an IT team.
                </p>

                <div className="chips-container flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
                    {modules.map((mod, idx) => (
                        <div key={idx} className="definition-chip flex items-center gap-2 px-4 py-2.5 rounded-full bg-sbos-royal/20 border border-sbos-electric/20 text-sm font-medium font-body backdrop-blur-sm transition-colors hover:bg-sbos-royal/40">
                            <mod.icon size={16} className="text-sbos-electric" />
                            <span>{mod.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhatIsSbos;
