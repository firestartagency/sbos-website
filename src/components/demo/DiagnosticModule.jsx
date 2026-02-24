import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Shield, Zap, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Mail, Loader2, Send } from 'lucide-react';
import { sendExecutionPayload, isWebhookConfigured } from '../../services/webhookService';
import { buildEmailHtml } from '../../services/emailTemplates';

const statusConfig = {
    stable: { color: '#18C37E', bg: '#18C37E12', label: 'Stable', icon: CheckCircle2 },
    'at-risk': { color: '#F5A524', bg: '#F5A52412', label: 'At Risk', icon: AlertTriangle },
    critical: { color: '#EF4444', bg: '#EF444412', label: 'Critical', icon: TrendingDown },
};

const DiagnosticModule = ({ data, recipientEmail, branding }) => {
    const scoreRingRef = useRef(null);
    const barsRef = useRef([]);
    const scoreNumRef = useRef(null);

    // Execution layer state
    const [sendStatus, setSendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

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

    // Handle sending the diagnostic email
    const handleSendReport = async () => {
        if (!recipientEmail || sendStatus === 'sending') return;

        setSendStatus('sending');
        try {
            const emailHtml = buildEmailHtml('health-diagnostic', data, branding);
            const subject = `Weekly Health Diagnostic — ${branding.companyName}`;

            await sendExecutionPayload('health-diagnostic', recipientEmail, branding, {
                emailHtml,
                subject,
                overallScore: data.overallScore,
                categories: data.categories,
                quickWins: data.quickWins,
                risks: data.risks,
            });

            setSendStatus('sent');
        } catch (err) {
            console.error('[DiagnosticModule] Send failed:', err);
            setSendStatus('error');
        }
    };

    if (!data) return null;

    const scoreColor = data.overallScore >= 75 ? '#18C37E' : data.overallScore >= 50 ? '#F5A524' : '#EF4444';
    const circumference = 2 * Math.PI * 54;

    return (
        <div className="space-y-6">
            {/* ═══════════ EXECUTION LAYER: Weekly Health Report ═══════════ */}
            {isWebhookConfigured() && (
                <div
                    className="rounded-2xl border shadow-sm p-6 transition-all duration-300"
                    style={{
                        borderColor: sendStatus === 'sent' ? '#18C37E40' : (branding?.primaryColor || '#2C3FB8') + '20',
                        backgroundColor: sendStatus === 'sent' ? '#18C37E08' : '#ffffff',
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: sendStatus === 'sent' ? '#18C37E15' : (branding?.primaryColor || '#2C3FB8') + '12',
                            }}
                        >
                            {sendStatus === 'sent' ? (
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                                <Mail size={20} style={{ color: branding?.primaryColor || '#2C3FB8' }} />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-sbos-navy">
                                {sendStatus === 'sent' ? 'Health report sent!' : 'Activate Weekly Health Report'}
                            </h3>
                            <p className="text-xs text-sbos-slate mt-0.5 leading-relaxed">
                                {sendStatus === 'sent'
                                    ? `Report delivered to ${recipientEmail}. Check your inbox.`
                                    : 'Get this diagnostic delivered to your inbox as a branded weekly report preview.'}
                            </p>

                            {sendStatus === 'error' && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSendReport}
                            disabled={sendStatus === 'sending' || sendStatus === 'sent' || !recipientEmail}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: sendStatus === 'sent' ? '#18C37E' : (branding?.primaryColor || '#2C3FB8'),
                            }}
                            onMouseEnter={(e) => { if (sendStatus === 'idle' || sendStatus === 'error') e.currentTarget.style.transform = 'scale(1.03)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            {sendStatus === 'sending' && <Loader2 size={14} className="animate-spin" />}
                            {sendStatus === 'sent' && <CheckCircle2 size={14} />}
                            {sendStatus === 'idle' && <Send size={14} />}
                            {sendStatus === 'error' && <Send size={14} />}
                            {sendStatus === 'sending' ? 'Sending...'
                                : sendStatus === 'sent' ? 'Sent ✓'
                                    : sendStatus === 'error' ? 'Retry'
                                        : 'Send Report'}
                        </button>
                    </div>

                    {!recipientEmail && sendStatus === 'idle' && (
                        <p className="text-[10px] text-amber-500 mt-3 ml-14">
                            No email provided during intake. Go back and add your email to enable this feature.
                        </p>
                    )}
                </div>
            )}

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
