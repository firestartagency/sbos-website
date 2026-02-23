import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Check, ArrowRight } from 'lucide-react';

const fitCriteria = [
    "We're using too many disconnected tools.",
    "Lead follow-up is inconsistent.",
    "Standard Operating Procedures live in people’s heads.",
    "We need a clearer plan than 'do more marketing'.",
    "We can start with one process and improve iteratively."
];

const FitCheck = () => {
    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const sectionRef = useRef(null);

    const score = selectedCriteria.length;

    let outcomeText = "Select your current challenges above.";
    let ctaText = "Explore Features";
    if (score > 0 && score <= 2) {
        outcomeText = "Worth exploring to fix immediate gaps.";
        ctaText = "See Demo Modules";
    } else if (score >= 3 && score <= 4) {
        outcomeText = "Strong fit. SBOS can consolidate your workflow.";
        ctaText = "Book a Walkthrough";
    } else if (score === 5) {
        outcomeText = "Perfect match. You need an operating system yesterday.";
        ctaText = "Book a Walkthrough";
    }

    const toggleCriterion = (index) => {
        setSelectedCriteria(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.fit-elem', {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="fit-check" ref={sectionRef} className="py-24 bg-sbos-cloud relative">
            <div className="max-w-4xl mx-auto px-6">

                <div className="text-center mb-16 fit-elem">
                    <h2 className="text-4xl font-heading font-bold text-sbos-navy mb-4">Is SBOS a good fit for your business?</h2>
                    <p className="text-xl text-sbos-slate">60 seconds to know if this demo is worth your time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-sbos-navy/5 border border-sbos-electric/10 fit-elem">

                    {/* Checklist Area */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        {fitCriteria.map((criterion, idx) => {
                            const isSelected = selectedCriteria.includes(idx);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => toggleCriterion(idx)}
                                    className={`flex items-start text-left gap-4 p-4 rounded-2xl transition-all duration-300 border ${isSelected ? 'bg-sbos-ice border-sbos-electric shadow-sm' : 'bg-transparent border-sbos-slate/20 hover:border-sbos-royal/40'}`}
                                >
                                    <div className={`mt-0.5 shrink-0 flex items-center justify-center h-6 w-6 rounded-md transition-colors ${isSelected ? 'bg-sbos-electric text-white' : 'border-2 border-sbos-slate/30'}`}>
                                        {isSelected && <Check size={16} strokeWidth={3} />}
                                    </div>
                                    <span className={`text-base leading-snug transition-colors ${isSelected ? 'text-sbos-navy font-medium' : 'text-sbos-slate'}`}>
                                        {criterion}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Outcome Area */}
                    <div className="md:col-span-2 flex flex-col justify-center bg-sbos-ice/50 rounded-3xl p-8 border border-sbos-royal/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sbos-electric">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" /><path d="M12 8h.01" />
                            </svg>
                        </div>

                        <p className="text-sm font-mono text-sbos-slate uppercase tracking-wider mb-2">Outcome</p>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-6xl font-heading font-bold text-sbos-navy leading-none transition-all duration-300">
                                {score}
                            </span>
                            <span className="text-lg text-sbos-slate font-medium mb-1">/ 5</span>
                        </div>

                        <p className="text-lg text-sbos-navy font-medium mb-8 leading-snug min-h-[3.5rem] transition-all duration-300">
                            {outcomeText}
                        </p>

                        <button className="flex items-center justify-center gap-2 bg-sbos-royal hover:bg-sbos-electric text-white w-full py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-sbos-electric/20 active:scale-95 group">
                            {ctaText}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FitCheck;
