import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
    Activity,
    AlertTriangle,
    TrendingUp,
    FileText,
    ArrowRightCircle,
    ChevronDown,
    ChevronRight,
    Database,
    BarChart,
    Target,
    Workflow,
    CheckSquare
} from 'lucide-react';

const moduleData = [
    {
        id: 'health',
        title: 'Business Health Diagnostic',
        icon: Activity,
        does: 'Analyzes your current operational footprint to establish a baseline score.',
        inputs: ['Basic revenue range', 'Number of current software tools', 'Primary operational bottleneck'],
        outputs: ['Overall Health Score (0-100)', 'Risk categorization matrix', 'Top 3 immediate priority fixes'],
        matters: 'You can’t fix what you haven’t measured. This gives you an honest look at where your business operations are fragile.',
        previewIcon: BarChart,
    },
    {
        id: 'leaks',
        title: 'Money Leak Finder',
        icon: AlertTriangle,
        does: 'Scans your tech stack and payroll inefficiencies to find wasted spend.',
        inputs: ['Current software subscriptions', 'Overlapping tool categories', 'Hours spent on manual data entry'],
        outputs: ['Total monthly waste estimate', 'Duplication flags', 'Consolidation recommendations'],
        matters: 'Most small businesses bleed 15-20% of their margin on unused or duplicative tools and manual labor that could be automated.',
        previewIcon: Database,
    },
    {
        id: 'growth',
        title: 'Growth Plan Generator',
        icon: TrendingUp,
        does: 'Transforms your scattered goals into a structured 3-phase execution roadmap.',
        inputs: ['Primary 90-day objective', 'Current biggest constraint', 'Available team capacity'],
        outputs: ['30-day "quick win" tasks', '60-day system builds', '90-day scaling milestones'],
        matters: 'Moving from reactive chaos to proactive execution requires a chronological plan, not just a to-do list.',
        previewIcon: Target,
    },
    {
        id: 'sop',
        title: 'SOP Builder',
        icon: FileText,
        does: 'Generates standardized operating procedures for your most critical workflows.',
        inputs: ['Process name/Goal', 'Key steps currently taken', 'Common errors to avoid'],
        outputs: ['Formatted SOP document', 'Quick-reference checklist', 'Training guide framework'],
        matters: 'If a process only lives in your head, you don’t own a business—you own a job. SOPs make your business sellable and scalable.',
        previewIcon: CheckSquare,
    },
    {
        id: 'automation',
        title: 'Lead Follow-Up',
        icon: ArrowRightCircle,
        does: 'Designs a starter automation sequence to ensure no lead falls through the cracks.',
        inputs: ['Primary lead source', 'Desired response time', 'Follow-up timeline logic'],
        outputs: ['Visual follow-up sequence map', 'Draft text/email templates', 'Automation readiness checklist'],
        matters: 'Speed to lead is everything in local service. A guaranteed follow-up sequence instantly increases conversion rates without extra work.',
        previewIcon: Workflow,
    }
];

const DemoModules = () => {
    const [activeTab, setActiveTab] = useState(0);
    const contentRef = useRef(null);
    const visualRef = useRef(null);
    const sectionRef = useRef(null);

    // Initial entrance animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%'
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    // Tab change animation
    useEffect(() => {
        if (!contentRef.current || !visualRef.current) return;

        const ctx = gsap.context(() => {
            // Crossfade logic
            gsap.fromTo(contentRef.current,
                { opacity: 0, x: -15 },
                { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
            );
            gsap.fromTo(visualRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
            );
        });

        return () => ctx.revert();
    }, [activeTab]);

    const activeModule = moduleData[activeTab];

    return (
        <section ref={sectionRef} id="demo" className="py-24 bg-white relative">
            <div className="max-w-6xl mx-auto px-6">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-heading font-bold text-sbos-navy mb-4">Inside the SBOS Demo</h2>
                    <p className="text-lg text-sbos-slate font-body">Explore the 5 integrated modules that take you from scattered operations to a clear execution system.</p>
                </div>

                {/* Desktop Layout: Tabs + Content Panel */}
                <div className="hidden lg:grid grid-cols-12 gap-10">

                    {/* Tabs Sidebar */}
                    <div className="col-span-4 flex flex-col gap-2 relative">
                        {/* Main progress line */}
                        <div className="absolute left-6 top-6 bottom-6 w-px bg-sbos-electric/10 z-0"></div>

                        {moduleData.map((mod, idx) => {
                            const isActive = activeTab === idx;
                            const isPast = activeTab > idx;

                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => setActiveTab(idx)}
                                    className={`relative z-10 flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sbos-electric
                     ${isActive ? 'bg-sbos-cloud border border-sbos-electric/20 shadow-sm' : 'hover:bg-sbos-ice/50 border border-transparent'}`}
                                >
                                    <div className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-300
                     ${isActive ? 'bg-sbos-electric text-white border border-sbos-electric' :
                                            isPast ? 'bg-sbos-success text-white border border-sbos-success' :
                                                'bg-white border-2 border-sbos-slate/20 text-transparent'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : isPast ? 'bg-white' : 'bg-transparent'}`}></div>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={`font-semibold transition-colors ${isActive ? 'text-sbos-navy' : 'text-sbos-slate'}`}>
                                            {idx + 1}. {mod.title}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="col-span-8 bg-sbos-cloud rounded-[2rem] border border-sbos-electric/10 p-10 shadow-lg shadow-sbos-navy/5 overflow-hidden relative">

                        {/* Blueprint accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blueprint-grid opacity-50 mix-blend-multiply pointer-events-none rounded-bl-[4rem]"></div>

                        <div className="grid grid-cols-2 gap-12 relative z-10">

                            {/* Left Data Column */}
                            <div ref={contentRef} className="flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2.5 bg-sbos-electric/10 text-sbos-electric rounded-xl">
                                        <activeModule.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-heading font-bold text-sbos-navy">{activeModule.title}</h3>
                                </div>

                                <p className="text-sbos-slate leading-relaxed mb-8">{activeModule.does}</p>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-mono font-semibold text-sbos-navy uppercase tracking-wider mb-3">Inputs Required</h4>
                                        <ul className="space-y-2">
                                            {activeModule.inputs.map((input, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-sbos-slate">
                                                    <ChevronRight size={16} className="text-sbos-royal shrink-0 mt-0.5" />
                                                    <span>{input}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-mono font-semibold text-sbos-navy uppercase tracking-wider mb-3">Generated Outputs</h4>
                                        <ul className="space-y-2">
                                            {activeModule.outputs.map((output, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-sbos-slate">
                                                    <CheckSquare size={16} className="text-sbos-success shrink-0 mt-0.5" />
                                                    <span className="font-medium text-sbos-navy">{output}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-sbos-electric/10">
                                    <p className="text-sm text-sbos-slate italic">
                                        <span className="font-semibold text-sbos-navy not-italic">Why it matters:</span> {activeModule.matters}
                                    </p>
                                </div>

                            </div>

                            {/* Right Visual Preview Column */}
                            <div ref={visualRef} className="flex items-center justify-center">
                                <div className="w-full aspect-square bg-white rounded-2xl shadow-xl shadow-sbos-navy/5 border border-sbos-royal/10 p-6 flex flex-col relative overflow-hidden group">
                                    {/* Decorative UI elements for the preview */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sbos-electric to-sbos-success"></div>

                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-20 h-4 bg-sbos-ice rounded relative overflow-hidden">
                                            <div className="absolute top-0 left-0 h-full w-1/3 bg-sbos-electric/20 rounded"></div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-sbos-cloud flex items-center justify-center text-sbos-electric">
                                            <activeModule.previewIcon size={16} />
                                        </div>
                                    </div>

                                    <div className="flex-1 border border-dashed border-sbos-slate/20 rounded-xl bg-sbos-cloud/50 flex flex-col items-center justify-center p-4 gap-4 transition-all duration-500 group-hover:border-sbos-electric/50 group-hover:bg-sbos-ice/30">
                                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center relative">
                                            <activeModule.icon size={28} className="text-sbos-navy" />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sbos-success rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="w-3/4 h-2 bg-sbos-slate/20 rounded-full mt-2"></div>
                                        <div className="w-1/2 h-2 bg-sbos-slate/10 rounded-full"></div>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <div className="flex-1 h-8 bg-sbos-ice rounded border border-sbos-royal/5"></div>
                                        <div className="w-8 h-8 bg-sbos-royal/10 rounded border border-sbos-royal/20"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Mobile Layout: Accordion */}
                <div className="lg:hidden flex flex-col gap-4">
                    {moduleData.map((mod, idx) => {
                        const isActive = activeTab === idx;
                        return (
                            <div
                                key={mod.id}
                                className={`flex flex-col overflow-hidden transition-all duration-500 rounded-2xl border ${isActive ? 'bg-sbos-cloud border-sbos-electric/30 shadow-md' : 'bg-white border-sbos-slate/20'}`}
                            >
                                <button
                                    onClick={() => setActiveTab(isActive ? -1 : idx)}
                                    className="flex items-center justify-between p-5 text-left focus:outline-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-sbos-electric/10 text-sbos-electric' : 'bg-sbos-ice text-sbos-slate'}`}>
                                            <mod.icon size={20} />
                                        </div>
                                        <span className={`font-semibold text-lg ${isActive ? 'text-sbos-navy' : 'text-sbos-slate'}`}>
                                            {idx + 1}. {mod.title}
                                        </span>
                                    </div>
                                    <ChevronDown size={20} className={`text-sbos-slate transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} />
                                </button>

                                <div
                                    className={`transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] origin-top ${isActive ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-5 pt-0 border-t border-sbos-electric/5 mt-2">
                                        <p className="text-sbos-slate text-sm mb-6 mt-4">{mod.does}</p>

                                        <div className="space-y-4 mb-6">
                                            <div>
                                                <h4 className="text-xs font-mono font-semibold text-sbos-navy uppercase tracking-wider mb-2">Inputs Required</h4>
                                                <ul className="space-y-1">
                                                    {mod.inputs.map((input, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-sbos-slate">
                                                            <ChevronRight size={14} className="text-sbos-royal shrink-0 mt-0.5" />
                                                            <span>{input}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-mono font-semibold text-sbos-navy uppercase tracking-wider mb-2">Generated Outputs</h4>
                                                <ul className="space-y-1">
                                                    {mod.outputs.map((output, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-sbos-slate">
                                                            <CheckSquare size={14} className="text-sbos-success shrink-0 mt-0.5" />
                                                            <span className="font-medium text-sbos-navy">{output}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-sbos-slate/10 mb-6">
                                            <p className="text-xs text-sbos-slate italic">
                                                <span className="font-semibold text-sbos-navy not-italic block mb-1">Why it matters:</span> {mod.matters}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default DemoModules;
