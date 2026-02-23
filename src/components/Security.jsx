import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, Lock, EyeOff, Server } from 'lucide-react';

const trustBlocks = [
    {
        icon: Shield,
        promise: "Demo-safe by default",
        how: "We use pre-loaded sample business data for all demo modules so you can see the system working without risking your own."
    },
    {
        icon: Lock,
        promise: "Your data stays yours",
        how: "When you upgrade, SBOS acts as a read-only layer over your existing tools unless you explicitly grant write access."
    },
    {
        icon: EyeOff,
        promise: "No surprise changes",
        how: "The generated SOPs and automation plans are suggestions. Nothing goes live until a human reviews and approves."
    },
    {
        icon: Server,
        promise: "Production-ready foundations",
        how: "Built on enterprise-grade infrastructure. What looks like a simple demo is backed by identical security protocols to our live product."
    }
];

const Security = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.trust-block', {
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power2.out'
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="security" className="py-24 bg-sbos-navy text-white relative overflow-hidden">
            {/* Blueprint background for dark mode */}
            <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E')]" />

            <div ref={containerRef} className="max-w-5xl mx-auto px-6 relative z-10">

                <div className="text-center mb-16 max-w-2xl mx-auto trust-block">
                    <span className="flex items-center justify-center gap-2 text-sbos-electric font-mono text-sm tracking-widest uppercase mb-4">
                        <Shield size={16} /> Trust & Data Handling
                    </span>
                    <h2 className="text-4xl font-heading font-bold mb-4">You shouldn't have to guess if software is safe.</h2>
                    <p className="text-lg text-sbos-ice/80 font-body">Clear, plain-English rules on how we handle the demo environment and your future production data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {trustBlocks.map((block, idx) => (
                        <div key={idx} className="trust-block bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300">
                            <div className="flex items-start gap-5">
                                <div className="p-3 bg-sbos-electric/20 rounded-xl text-sbos-electric shrink-0">
                                    <block.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-heading font-bold mb-1 text-white">{block.promise}</h3>
                                    <p className="text-sbos-ice/70 text-sm font-mono tracking-wider uppercase mb-3">The Promise</p>

                                    <div className="h-px w-full bg-white/10 my-4"></div>

                                    <p className="text-sbos-electric text-xs font-mono tracking-wider uppercase mb-2">How we do it</p>
                                    <p className="text-sbos-ice/90 leading-relaxed">{block.how}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Security;
