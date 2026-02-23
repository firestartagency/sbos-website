import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const comparisonCards = [
    {
        category: 'Clarity & Visibility',
        today: {
            headline: 'Scattered across 5+ logins',
            body: 'Revenue data lives in your invoicing tool. Customer notes live in email. Task lists sit in a spreadsheet. Nobody has a single view of what\'s actually happening.',
        },
        sbos: {
            headline: 'Unified dashboard snapshot',
            body: 'One diagnostic view pulls together the signals that matter — health score, bottlenecks, and quick wins — without needing to log into five different apps.',
        },
    },
    {
        category: 'Speed to Insight',
        today: {
            headline: 'Days of manual export and analysis',
            body: 'Every quarter you export CSVs, cross-reference spreadsheets, and try to piece together what\'s working. By the time you see the pattern, the window has closed.',
        },
        sbos: {
            headline: 'Instant diagnostic scoring',
            body: 'SBOS runs your intake answers through a structured framework and surfaces a scored snapshot in minutes — not days. You see where to focus before you lose momentum.',
        },
    },
    {
        category: 'Process Consistency',
        today: {
            headline: 'Locked in employee heads or lost docs',
            body: 'Your best processes only exist because one person knows how to do them. When they\'re out sick, on vacation, or gone — the process goes with them.',
        },
        sbos: {
            headline: 'Auto-generated, centralized SOPs',
            body: 'SBOS generates starter SOPs from your intake data and organizes them in one place. Your team follows the same steps every time, regardless of who\'s working.',
        },
    },
    {
        category: 'Follow-Up Reliability',
        today: {
            headline: 'Dependent on human memory',
            body: 'Leads slip through because someone forgot to follow up. Onboarding steps get skipped. The "system" is really just sticky notes and good intentions.',
        },
        sbos: {
            headline: 'Guaranteed automated sequences',
            body: 'SBOS builds a basic follow-up automation flow — messages go out on schedule, every time. No one has to remember, and nothing falls through the cracks.',
        },
    },
    {
        category: 'Ease of Implementation',
        today: {
            headline: 'Requires IT or hours of setup',
            body: 'New tools mean migration headaches, onboarding sessions, and months before anyone actually uses the thing consistently. Most small businesses give up.',
        },
        sbos: {
            headline: 'Guided ~10 minute demo deployment',
            body: 'The SBOS demo walks you through the full system in about 10 minutes using sample data. No IT team, no migration, no commitment — just clarity.',
        },
    },
    {
        category: 'Actionability of Outputs',
        today: {
            headline: 'Vague advice or raw data dumps',
            body: 'Consultants hand you a 40-page PDF. Analytics tools give you charts with no context. You end up with more information and less direction than when you started.',
        },
        sbos: {
            headline: 'Structured 30/60/90 day plan',
            body: 'SBOS generates a prioritized growth roadmap with weekly action items. You know exactly what to do first, what comes next, and what the 90-day outcome looks like.',
        },
    },
];

const TOTAL_CARDS = comparisonCards.length;

const Comparison = () => {
    const sectionRef = useRef(null);
    const pinContainerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const cards = cardsRef.current.filter(Boolean);
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            // Set initial state: first card visible, rest below viewport
            cards.forEach((card, i) => {
                if (i === 0) {
                    gsap.set(card, { yPercent: 0, scale: 1, opacity: 1 });
                } else {
                    gsap.set(card, { yPercent: 100, scale: 0.95, opacity: 0 });
                }
            });

            // Create the master pinned timeline
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: pinContainerRef.current,
                    start: 'top top',
                    end: `+=${(TOTAL_CARDS - 1) * 120}vh`,
                    pin: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                },
            });

            // Animate each card in sequence
            cards.forEach((card, i) => {
                if (i < TOTAL_CARDS - 1) {
                    tl.to(
                        cards[i + 1],
                        {
                            yPercent: 0,
                            scale: 1,
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.inOut',
                        },
                        i
                    );

                    tl.to(
                        card,
                        {
                            scale: 0.92,
                            opacity: 0.4,
                            duration: 1,
                            ease: 'power2.inOut',
                        },
                        i
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-sbos-cloud">
            {/* Pinned container — header + cards together so header stays visible */}
            <div
                ref={pinContainerRef}
                className="relative h-screen flex flex-col overflow-hidden"
            >
                {/* Section Header — inside pinned area so it stays visible */}
                <div className="flex-shrink-0 pt-16 pb-6 text-center px-6">
                    <span className="inline-block text-xs font-mono font-semibold text-sbos-electric uppercase tracking-widest mb-4 bg-sbos-electric/5 px-4 py-1.5 rounded-full border border-sbos-electric/10">
                        Today vs. SBOS
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-sbos-navy mb-3 leading-tight">
                        The Cost of <span className="font-accent italic text-sbos-royal">Doing Nothing</span>
                    </h2>
                    <p className="text-base text-sbos-slate font-body max-w-lg mx-auto">
                        Operating without a system creates invisible friction. See what changes when you stop patching and start building.
                    </p>
                </div>

                {/* Cards stack — positioned directly below header */}
                <div className="relative flex-1 w-full max-w-3xl mx-auto px-6">
                    {comparisonCards.map((card, idx) => (
                        <div
                            key={idx}
                            ref={(el) => (cardsRef.current[idx] = el)}
                            className="absolute inset-x-0 top-0 mx-6 rounded-3xl bg-white border border-sbos-electric/10 shadow-2xl shadow-sbos-navy/8 overflow-hidden will-change-transform"
                            style={{ zIndex: idx + 1 }}
                        >
                            {/* Category Label */}
                            <div className="px-6 md:px-8 pt-5 md:pt-7 pb-2">
                                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.15em] text-sbos-slate/60 bg-sbos-cloud px-3 py-1 rounded-full border border-sbos-slate/10">
                                    {card.category}
                                </span>
                            </div>

                            {/* Card Body — split layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {/* TODAY Column */}
                                <div className="px-6 md:px-8 py-5 md:py-6 md:border-r border-sbos-slate/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-5 rounded-full bg-red-400/60" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400/80">Today</span>
                                    </div>
                                    <h4 className="text-base md:text-lg font-heading font-bold text-sbos-navy/70 mb-2">
                                        {card.today.headline}
                                    </h4>
                                    <p className="text-sm text-sbos-slate leading-relaxed">
                                        {card.today.body}
                                    </p>
                                </div>

                                {/* WITH SBOS Column */}
                                <div className="px-6 md:px-8 py-5 md:py-6 bg-sbos-ice/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1 h-5 rounded-full bg-sbos-electric" />
                                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-sbos-electric">With SBOS</span>
                                    </div>
                                    <h4 className="text-base md:text-lg font-heading font-bold text-sbos-navy mb-2">
                                        {card.sbos.headline}
                                    </h4>
                                    <p className="text-sm text-sbos-navy/70 leading-relaxed">
                                        {card.sbos.body}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer (only on last card) */}
                            {idx === TOTAL_CARDS - 1 && (
                                <div className="bg-sbos-cloud/40 border-t border-sbos-electric/10 px-8 py-5 flex items-center justify-center">
                                    <a
                                        href="#demo"
                                        className="inline-flex items-center gap-2 bg-white border border-sbos-royal/20 hover:border-sbos-electric text-sbos-navy px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-sbos-electric/10 group"
                                    >
                                        See it in action
                                        <ArrowRight size={16} className="text-sbos-electric group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress dots */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                    {comparisonCards.map((_, idx) => (
                        <div
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full bg-sbos-navy/15"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Comparison;
