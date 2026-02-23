import React, { useState } from 'react';
import { Calendar, Target, Clock, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

const effortColors = {
    low: { bg: '#18C37E15', text: '#18C37E', label: 'Low Effort' },
    medium: { bg: '#3366FF15', text: '#3366FF', label: 'Med Effort' },
    high: { bg: '#F5A52415', text: '#F5A524', label: 'High Effort' },
};

const impactColors = {
    low: { bg: '#6B728015', text: '#6B7280', label: 'Low Impact' },
    medium: { bg: '#3B82F615', text: '#3B82F6', label: 'Med Impact' },
    high: { bg: '#8B5CF615', text: '#8B5CF6', label: 'High Impact' },
};

const phases = [
    { key: 'thirtyDay', label: '30 Days', range: 'Weeks 1-4', color: '#18C37E' },
    { key: 'sixtyDay', label: '60 Days', range: 'Weeks 5-8', color: '#3366FF' },
    { key: 'ninetyDay', label: '90 Days', range: 'Weeks 9-12', color: '#8B5CF6' },
];

const GrowthPlanModule = ({ data }) => {
    const [activePhase, setActivePhase] = useState('thirtyDay');

    if (!data) return null;

    const currentPhase = phases.find(p => p.key === activePhase);
    const phaseData = data[activePhase];

    return (
        <div className="space-y-6">
            {/* Phase Timeline */}
            <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Calendar size={16} className="text-sbos-electric" />
                    <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest">Growth Roadmap</p>
                </div>

                {/* Phase Selector */}
                <div className="relative flex items-center">
                    {/* Connection line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sbos-navy/5 -translate-y-1/2" />

                    <div className="relative flex justify-between w-full">
                        {phases.map((phase, idx) => {
                            const isActive = activePhase === phase.key;
                            const phaseIdx = phases.findIndex(p => p.key === activePhase);
                            const isCompleted = idx < phaseIdx;
                            return (
                                <button
                                    key={phase.key}
                                    onClick={() => setActivePhase(phase.key)}
                                    className="flex flex-col items-center gap-2 relative z-10"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isActive
                                            ? 'scale-110 shadow-lg'
                                            : isCompleted
                                                ? 'scale-100'
                                                : 'scale-100 bg-white'
                                            }`}
                                        style={{
                                            backgroundColor: isActive || isCompleted ? phase.color : 'white',
                                            borderColor: isActive || isCompleted ? phase.color : '#E8ECF4',
                                            boxShadow: isActive ? `0 4px 14px ${phase.color}30` : 'none',
                                        }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 size={20} className="text-white" />
                                        ) : (
                                            <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-sbos-slate'}`}>
                                                {phase.label.split(' ')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-xs font-semibold ${isActive ? 'text-sbos-navy' : 'text-sbos-slate'}`}>{phase.label}</p>
                                        <p className="text-[10px] font-mono text-sbos-slate/60">{phase.range}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Phase Header */}
            <div className="px-1">
                <div className="flex items-center gap-3">
                    <div
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: currentPhase.color }}
                    />
                    <div>
                        <h3 className="text-lg font-heading font-bold text-sbos-navy">{phaseData.theme}</h3>
                        <p className="text-xs font-mono text-sbos-slate">{phaseData.priorities.length} priorities • {currentPhase.range}</p>
                    </div>
                </div>
            </div>

            {/* Priority Cards */}
            <div className="space-y-4">
                {phaseData.priorities.map((item, idx) => {
                    const effort = effortColors[item.effort];
                    const impact = impactColors[item.impact];
                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <Circle size={20} className="text-sbos-navy/15" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-sbos-navy leading-snug mb-2">{item.task}</p>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: effort.bg, color: effort.text }}
                                        >
                                            {effort.label}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: impact.bg, color: impact.text }}
                                        >
                                            {impact.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-sbos-slate flex items-center gap-1.5">
                                        <ArrowRight size={10} className="text-sbos-electric" />
                                        {item.addressesIssue}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <div className="flex items-center gap-1 text-sbos-slate">
                                        <Clock size={12} />
                                        <span className="text-xs font-mono">Week {item.weekTarget}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GrowthPlanModule;
