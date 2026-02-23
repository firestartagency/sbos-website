import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, ChevronDown, ChevronUp, Target, BarChart3 } from 'lucide-react';

const channelConfig = {
    email: { icon: Mail, color: '#3366FF', bg: '#3366FF12', label: 'Email' },
    sms: { icon: MessageSquare, color: '#18C37E', bg: '#18C37E12', label: 'SMS' },
    phone: { icon: Phone, color: '#8B5CF6', bg: '#8B5CF612', label: 'Phone' },
};

const typeLabels = {
    welcome: 'Welcome',
    value: 'Value Add',
    nudge: 'Nudge',
    'case-study': 'Case Study',
    'direct-ask': 'Direct Ask',
    'last-chance': 'Last Chance',
    breakup: 'Breakup',
};

const LeadAutomationModule = ({ data }) => {
    const [expandedTouch, setExpandedTouch] = useState(0);

    if (!data) return null;

    const toggleTouch = (idx) => {
        setExpandedTouch(prev => prev === idx ? -1 : idx);
    };

    return (
        <div className="space-y-6">
            {/* Sequence Header */}
            <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-sbos-navy mb-1">{data.sequenceName}</h3>
                        <p className="text-sm text-sbos-slate">
                            {data.touches.length} touchpoints over {data.totalDuration}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {Object.entries(data.expectedMetrics).map(([key, val]) => {
                            const labels = { openRate: 'Open Rate', replyRate: 'Reply Rate', conversionRate: 'Conversion' };
                            return (
                                <div key={key} className="text-center px-3 py-2 bg-sbos-cloud rounded-xl">
                                    <p className="text-xs font-mono text-sbos-slate">{labels[key]}</p>
                                    <p className="text-sm font-bold text-sbos-navy">{val}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Flow Map — Visual Timeline */}
            <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={16} className="text-sbos-electric" />
                    <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest">Sequence Flow</p>
                </div>

                {/* Horizontal flow on desktop */}
                <div className="hidden md:flex items-start justify-between relative">
                    {/* Connection line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-sbos-navy/[0.06]" />

                    {data.touches.map((touch, idx) => {
                        const channel = channelConfig[touch.channel];
                        const ChannelIcon = channel.icon;
                        const isActive = expandedTouch === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleTouch(idx)}
                                className="flex flex-col items-center gap-2 relative z-10"
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
                                    style={{
                                        backgroundColor: isActive ? channel.color : 'white',
                                        borderColor: channel.color,
                                        boxShadow: isActive ? `0 4px 14px ${channel.color}30` : 'none',
                                    }}
                                >
                                    <ChannelIcon size={18} style={{ color: isActive ? 'white' : channel.color }} />
                                </div>
                                <span className="text-[10px] font-mono text-sbos-slate">
                                    Day {touch.day}
                                </span>
                                <span className={`text-[10px] font-semibold ${isActive ? 'text-sbos-navy' : 'text-sbos-slate/60'}`}>
                                    {typeLabels[touch.type] || touch.type}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Mobile — Vertical list */}
                <div className="md:hidden space-y-3">
                    {data.touches.map((touch, idx) => {
                        const channel = channelConfig[touch.channel];
                        const ChannelIcon = channel.icon;
                        const isActive = expandedTouch === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleTouch(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${isActive ? 'bg-sbos-cloud border border-sbos-electric/15' : 'hover:bg-sbos-cloud/50'}`}
                            >
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: channel.bg }}
                                >
                                    <ChannelIcon size={16} style={{ color: channel.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-sbos-navy">Day {touch.day} — {typeLabels[touch.type]}</span>
                                </div>
                                <span className="text-[10px] font-mono" style={{ color: channel.color }}>{channel.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Expanded Touch Detail */}
            {expandedTouch >= 0 && expandedTouch < data.touches.length && (
                <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm overflow-hidden">
                    {(() => {
                        const touch = data.touches[expandedTouch];
                        const channel = channelConfig[touch.channel];
                        const ChannelIcon = channel.icon;
                        return (
                            <>
                                <div className="px-6 py-4 border-b border-sbos-navy/5 bg-sbos-cloud/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: channel.bg }}
                                        >
                                            <ChannelIcon size={16} style={{ color: channel.color }} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold text-sbos-navy">
                                                Day {touch.day} — {typeLabels[touch.type]}
                                            </span>
                                            <span className="text-xs font-mono ml-2" style={{ color: channel.color }}>{channel.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-sbos-slate">
                                        <Target size={12} />
                                        {touch.purpose}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {touch.subject && (
                                        <div className="mb-3">
                                            <p className="text-xs font-mono text-sbos-slate mb-1">Subject</p>
                                            <p className="text-sm font-semibold text-sbos-navy">{touch.subject}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-mono text-sbos-slate mb-2">Message</p>
                                        <div className="bg-sbos-cloud/40 rounded-xl p-4 border border-sbos-navy/[0.03]">
                                            <pre className="text-sm text-sbos-ink leading-relaxed whitespace-pre-wrap font-body">
                                                {touch.body}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default LeadAutomationModule;
