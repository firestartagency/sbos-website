import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MessageCircleQuestion, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const faqData = [
    {
        q: 'Is this a real product or just a concept demo?',
        a: 'SBOS is a live operating system. This specific demo environment uses sample data so you can experience the workflow instantly, but the underlying engines (health scoring, SOP generation, etc.) are the exact same tools used in production.',
    },
    {
        q: 'Do I need to connect my tools to try the demo?',
        a: 'No. The demo runs entirely on pre-loaded sample business data. You don\u2019t need to authenticate any external accounts, upload CSVs, or provide API keys to see how it works.',
    },
    {
        q: 'Can I use my own business data later?',
        a: 'Yes. Once you complete a guided walkthrough and choose to deploy SBOS for your company, we securely integrate with your existing tech stack (CRM, accounting, project management) to provide live telemetry.',
    },
    {
        q: 'Does SBOS replace my CRM or accounting software?',
        a: 'No. SBOS is an orchestration layer. It sits on top of your existing tools to find leaks and enforce process. We believe in letting specialized tools (like QuickBooks or HubSpot) do what they do best, while SBOS acts as the ultimate command center.',
    },
    {
        q: 'Can the SOP outputs be customized to my specific industry?',
        a: 'Absolutely. The templates generated in the demo are foundational. In production, the system learns your specific operational terminology and adapts the procedures to fit whether you run a plumbing business, a digital agency, or a consulting firm.',
    },
    {
        q: 'What happens after I finish the demo?',
        a: 'You\u2019ll have a clear understanding of what a \u201CBusiness Operating System\u201D actually looks like. From there, the next step is to book a 1-on-1 walkthrough where we look at how easily SBOS can map to your specific current reality.',
    },
];

const TOTAL_CARDS = faqData.length;

const Faq = () => {
    const sectionRef = useRef(null);
    const pinContainerRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const cards = cardsRef.current.filter(Boolean);
        if (cards.length === 0) return;

        const ctx = gsap.context(() => {
            // Set initial card states
            cards.forEach((card, i) => {
                if (i === 0) {
                    gsap.set(card, { yPercent: 0, scale: 1, opacity: 1 });
                } else {
                    gsap.set(card, { yPercent: 100, scale: 0.95, opacity: 0 });
                }
            });

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

            cards.forEach((card, i) => {
                if (i < TOTAL_CARDS - 1) {
                    tl.to(
                        cards[i + 1],
                        { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: 'power2.inOut' },
                        i
                    );
                    tl.to(
                        card,
                        { scale: 0.92, opacity: 0.4, duration: 1, ease: 'power2.inOut' },
                        i
                    );
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="faq" className="relative bg-white">
            <div
                ref={pinContainerRef}
                className="relative h-screen flex flex-col overflow-hidden"
            >
                {/* Section Header — inside pinned area */}
                <div className="flex-shrink-0 pt-16 pb-6 text-center px-6">
                    <span className="inline-block text-xs font-mono font-semibold text-sbos-electric uppercase tracking-widest mb-4 bg-sbos-electric/5 px-4 py-1.5 rounded-full border border-sbos-electric/10">
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-sbos-navy mb-3 leading-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base text-sbos-slate font-body max-w-lg mx-auto">
                        Straight answers to common concerns. No fluff.
                    </p>
                </div>

                {/* Cards stack */}
                <div className="relative flex-1 w-full max-w-3xl mx-auto px-6">
                    {faqData.map((faq, idx) => (
                        <div
                            key={idx}
                            ref={(el) => (cardsRef.current[idx] = el)}
                            className="absolute inset-x-0 top-0 mx-6 rounded-3xl bg-white border border-sbos-electric/10 shadow-2xl shadow-sbos-navy/8 overflow-hidden will-change-transform"
                            style={{ zIndex: idx + 1 }}
                        >
                            <div className="p-6 md:p-8">
                                {/* Question Number + Icon */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sbos-electric/10 text-sbos-electric">
                                        <MessageCircleQuestion size={20} />
                                    </div>
                                    <span className="text-xs font-mono font-bold text-sbos-slate/50 uppercase tracking-widest">
                                        Question {idx + 1} of {TOTAL_CARDS}
                                    </span>
                                </div>

                                {/* Question */}
                                <h3 className="text-xl md:text-2xl font-heading font-bold text-sbos-navy mb-4 leading-snug">
                                    {faq.q}
                                </h3>

                                {/* Divider */}
                                <div className="h-px w-full bg-sbos-electric/10 mb-4" />

                                {/* Answer */}
                                <p className="text-base text-sbos-slate leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>

                            {/* CTA on last card */}
                            {idx === TOTAL_CARDS - 1 && (
                                <div className="bg-sbos-cloud/40 border-t border-sbos-electric/10 px-8 py-5 flex items-center justify-center gap-6">
                                    <span className="text-sm text-sbos-slate">Still have questions?</span>
                                    <a
                                        href="#"
                                        className="inline-flex items-center gap-2 bg-white border border-sbos-royal/20 hover:border-sbos-electric text-sbos-navy px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-sbos-electric/10 group"
                                    >
                                        Get in touch
                                        <ArrowRight size={14} className="text-sbos-electric group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress dots */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
                    {faqData.map((_, idx) => (
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

export default Faq;
