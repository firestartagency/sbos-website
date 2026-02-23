import React, { useState } from 'react';
import { FileText, User, Clock, Wrench, ChevronDown, ChevronUp, Download, Copy } from 'lucide-react';

const roleColors = {
    'Sales': '#3366FF',
    'Operations': '#18C37E',
    'Account Manager': '#8B5CF6',
    'Finance': '#F5A524',
    'Admin': '#6B7280',
};

const getRoleColor = (role) => roleColors[role] || '#6B7280';

const SopBuilderModule = ({ data }) => {
    const [activeSop, setActiveSop] = useState(0);
    const [expandedSteps, setExpandedSteps] = useState({});

    if (!data || !data.sops) return null;

    const sop = data.sops[activeSop];

    const toggleStep = (idx) => {
        setExpandedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    return (
        <div className="space-y-6">
            {/* SOP Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {data.sops.map((s, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveSop(idx); setExpandedSteps({}); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0
                            ${activeSop === idx
                                ? 'bg-sbos-royal text-white shadow-lg shadow-sbos-royal/20'
                                : 'bg-white border border-sbos-navy/10 text-sbos-navy hover:border-sbos-electric/30'
                            }`}
                    >
                        <FileText size={14} />
                        {s.title}
                    </button>
                ))}
            </div>

            {/* SOP Document Card */}
            <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm overflow-hidden">
                {/* Document Header */}
                <div className="p-6 border-b border-sbos-navy/5 bg-sbos-cloud/30">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-heading font-bold text-sbos-navy mb-2">{sop.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-sbos-slate">
                                <span className="flex items-center gap-1">
                                    <User size={12} />
                                    Owner: <strong className="text-sbos-navy">{sop.owner}</strong>
                                </span>
                                <span className="text-sbos-navy/10">|</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {sop.frequency}
                                </span>
                                <span className="text-sbos-navy/10">|</span>
                                <span className="font-mono">~{sop.estimatedTime}</span>
                                <span className="text-sbos-navy/10">|</span>
                                <span className="font-mono">v{sop.version}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-sbos-ice text-sbos-slate hover:text-sbos-navy transition-colors" title="Copy SOP">
                                <Copy size={16} />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-sbos-ice text-sbos-slate hover:text-sbos-navy transition-colors" title="Download PDF">
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="p-6">
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-sbos-navy/[0.06]" />

                        <div className="space-y-0">
                            {sop.steps.map((step, idx) => {
                                const isExpanded = expandedSteps[idx] !== false; // default open
                                const roleColor = getRoleColor(step.owner);
                                return (
                                    <div key={idx} className="relative pl-12 pb-6 last:pb-0">
                                        {/* Step number circle */}
                                        <div
                                            className="absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold z-10"
                                            style={{ backgroundColor: roleColor }}
                                        >
                                            {step.number}
                                        </div>

                                        <button
                                            onClick={() => toggleStep(idx)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-sbos-navy leading-snug pr-4">{step.action}</p>
                                                {isExpanded ? <ChevronUp size={14} className="text-sbos-slate flex-shrink-0" /> : <ChevronDown size={14} className="text-sbos-slate flex-shrink-0" />}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-2 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span
                                                        className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full"
                                                        style={{ backgroundColor: `${roleColor}15`, color: roleColor }}
                                                    >
                                                        <User size={10} />
                                                        {step.owner}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-sbos-slate">
                                                        <Clock size={10} />
                                                        {step.timing}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {step.tools.map((tool, tIdx) => (
                                                        <span key={tIdx} className="text-[10px] font-mono font-semibold bg-sbos-navy/[0.04] text-sbos-navy px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <Wrench size={9} />
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                                {step.notes && (
                                                    <p className="text-xs text-sbos-slate italic">💡 {step.notes}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SopBuilderModule;
