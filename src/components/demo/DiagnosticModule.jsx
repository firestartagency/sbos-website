import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Shield, Zap, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';

const statusConfig = {
    stable: { color: '#18C37E', bg: '#18C37E12', label: 'Stable', icon: CheckCircle2 },
    'at-risk': { color: '#F5A524', bg: '#F5A52412', label: 'At Risk', icon: AlertTriangle },
    critical: { color: '#EF4444', bg: '#EF444412', label: 'Critical', icon: TrendingDown },
};

const DiagnosticModule = ({ data }) => {
    const scoreRingRef = useRef(null);
    const barsRef = useRef([]);
    const scoreNumRef = useRef(null);

    useEffect(() => {
        if (!data) return;

        // Animate score ring
        const circumference = 2 * Math.PI * 54; // r=54
        const ring = scoreRingRef.current;
        if (ring) {
            gsap.fromTo(ring,
                { strokeDashoffset: circumference },
                {
                    strokeDashoffset: circumference * (1 - data.overallScore / 100),
                    duration: 1.8,
                    ease: 'power3.out',
                    delay: 0.3,
                }
            );
        }

        // Animate score number counter
        if (scoreNumRef.current) {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: data.overallScore,
                duration: 1.8,
                ease: 'power3.out',
                delay: 0.3,
                onUpdate: () => {
                    if (scoreNumRef.current) {
                        scoreNumRef.current.textContent = Math.round(counter.val);
                    }
                },
            });
        }

        // Animate category bars
        barsRef.current.forEach((bar, i) => {
            if (bar) {
                gsap.fromTo(bar,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                        delay: 0.5 + i * 0.12,
                        transformOrigin: 'left center',
                    }
                );
            }
        });
    }, [data]);

    if (!data) return null;

    const scoreColor = data.overallScore >= 75 ? '#18C37E' : data.overallScore >= 50 ? '#F5A524' : '#EF4444';
    const circumference = 2 * Math.PI * 54;

    return (
        <div className="space-y-6">
            {/* Score + Categories Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Score Card */}
                <div className="md:col-span-1 bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6 flex flex-col items-center justify-center">
                    <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest mb-4">Overall Score</p>
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                            {/* Track */}
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#E8ECF4" strokeWidth="8" />
                            {/* Progress */}
                            <circle
                                ref={scoreRingRef}
                                cx="60" cy="60" r="54"
                                fill="none"
                                stroke={scoreColor}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference}
                                style={{ filter: `drop-shadow(0 0 6px ${scoreColor}40)` }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span ref={scoreNumRef} className="text-4xl font-heading font-bold text-sbos-navy">0</span>
                            <span className="text-xs font-mono text-sbos-slate">/100</span>
                        </div>
                    </div>
                    <p className="text-sm text-sbos-slate mt-3 text-center">
                        {data.overallScore >= 75 ? 'Looking solid — a few areas to optimize' : data.overallScore >= 50 ? 'Room for improvement across key areas' : 'Critical gaps need attention'}
                    </p>
                </div>

                {/* Category Breakdown */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6">
                    <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest mb-5">Category Breakdown</p>
                    <div className="space-y-4">
                        {data.categories.map((cat, idx) => {
                            const status = statusConfig[cat.status];
                            const StatusIcon = status.icon;
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-semibold text-sbos-navy">{cat.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono font-bold" style={{ color: status.color }}>{cat.score}</span>
                                            <span
                                                className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: status.bg, color: status.color }}
                                            >
                                                <StatusIcon size={10} />
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-sbos-navy/[0.04] rounded-full overflow-hidden">
                                        <div
                                            ref={el => barsRef.current[idx] = el}
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${cat.score}%`,
                                                backgroundColor: status.color,
                                                transform: 'scaleX(0)',
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-sbos-slate mt-1">{cat.insight}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Wins + Risks Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Wins */}
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Zap size={16} className="text-emerald-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-sbos-navy uppercase tracking-wide">Quick Wins</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.quickWins.map((win, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-sbos-ink leading-relaxed">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {win}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Risks */}
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Shield size={16} className="text-amber-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-sbos-navy uppercase tracking-wide">Identified Risks</h3>
                    </div>
                    <ul className="space-y-3">
                        {data.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-sbos-ink leading-relaxed">
                                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                {risk}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticModule;
