import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { AlertCircle, ArrowDown, Link2, CircleDashed, DollarSign, Mail, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { sendExecutionPayload, isWebhookConfigured } from '../../services/webhookService';
import { buildEmailHtml } from '../../services/emailTemplates';

const severityConfig = {
    critical: { color: '#EF4444', bg: '#EF444412', label: 'Critical' },
    high: { color: '#F5A524', bg: '#F5A52412', label: 'High' },
    moderate: { color: '#3B82F6', bg: '#3B82F612', label: 'Moderate' },
    low: { color: '#6B7280', bg: '#6B728012', label: 'Low' },
};

const typeIcons = {
    duplicate: Link2,
    underutilized: CircleDashed,
    overlap: AlertCircle,
};

const MoneyLeaksModule = ({ data, recipientEmail, branding }) => {
    const savingsRef = useRef(null);
    const spendRef = useRef(null);

    // Execution layer state
    const [sendStatus, setSendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

    useEffect(() => {
        if (!data) return;

        // Animate savings counter
        if (savingsRef.current) {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: data.potentialSavings,
                duration: 2,
                ease: 'power3.out',
                delay: 0.4,
                onUpdate: () => {
                    if (savingsRef.current) {
                        savingsRef.current.textContent = `$${Math.round(counter.val).toLocaleString()}`;
                    }
                },
            });
        }

        // Animate total spend counter
        if (spendRef.current) {
            const counter = { val: 0 };
            gsap.to(counter, {
                val: data.totalMonthlySpend,
                duration: 2,
                ease: 'power3.out',
                delay: 0.2,
                onUpdate: () => {
                    if (spendRef.current) {
                        spendRef.current.textContent = `$${Math.round(counter.val).toLocaleString()}`;
                    }
                },
            });
        }
    }, [data]);

    // Handle sending the money leaks email
    const handleSendReport = async () => {
        if (!recipientEmail || sendStatus === 'sending') return;

        setSendStatus('sending');
        try {
            const emailHtml = buildEmailHtml('money-leaks', data, branding);
            const subject = `Weekly Money Leak Report — ${branding.companyName}`;

            await sendExecutionPayload('money-leaks', recipientEmail, branding, {
                emailHtml,
                subject,
                totalMonthlyWaste: `$${data.potentialSavings?.toLocaleString() || '0'}`,
                leaks: data.leaks,
                recommendations: data.leaks.map(l => l.recommendation).filter(Boolean),
            });

            setSendStatus('sent');
        } catch (err) {
            console.error('[MoneyLeaksModule] Send failed:', err);
            setSendStatus('error');
        }
    };

    if (!data) return null;

    const savingsPercent = Math.round((data.potentialSavings / data.totalMonthlySpend) * 100);
    const maxCategorySpend = Math.max(...data.spendByCategory.map(c => c.amount));

    return (
        <div className="space-y-6">
            {/* ═══════════ EXECUTION LAYER: Money Leak Report ═══════════ */}
            {isWebhookConfigured() && (
                <div
                    className="rounded-2xl border shadow-sm p-6 transition-all duration-300"
                    style={{
                        borderColor: sendStatus === 'sent' ? '#18C37E40' : '#F5A52430',
                        backgroundColor: sendStatus === 'sent' ? '#18C37E08' : '#ffffff',
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: sendStatus === 'sent' ? '#18C37E15' : '#F5A52415',
                            }}
                        >
                            {sendStatus === 'sent' ? (
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                                <Mail size={20} className="text-amber-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-sbos-navy">
                                {sendStatus === 'sent' ? 'Money leak report sent!' : 'Send Money Leak Report'}
                            </h3>
                            <p className="text-xs text-sbos-slate mt-0.5 leading-relaxed">
                                {sendStatus === 'sent'
                                    ? `Report delivered to ${recipientEmail}. Check your inbox.`
                                    : 'Get this savings analysis delivered to your inbox as a branded report.'}
                            </p>

                            {sendStatus === 'error' && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSendReport}
                            disabled={sendStatus === 'sending' || !recipientEmail}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: sendStatus === 'sent' ? '#18C37E' : (branding?.primaryColor || '#2C3FB8'),
                            }}
                            onMouseEnter={(e) => { if (sendStatus !== 'sending') e.currentTarget.style.transform = 'scale(1.03)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            {sendStatus === 'sending' && <Loader2 size={14} className="animate-spin" />}
                            {sendStatus === 'sent' && <CheckCircle2 size={14} />}
                            {(sendStatus === 'idle' || sendStatus === 'error') && <Send size={14} />}
                            {sendStatus === 'sending' ? 'Sending...'
                                : sendStatus === 'sent' ? 'Resend'
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

            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-5">
                    <p className="text-xs font-mono text-sbos-slate uppercase tracking-widest mb-1">Monthly Spend</p>
                    <p ref={spendRef} className="text-3xl font-heading font-bold text-sbos-navy">$0</p>
                    <p className="text-xs text-sbos-slate mt-1">{data.spendByCategory.reduce((s, c) => s + c.tools, 0)} tools across {data.spendByCategory.length} categories</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-50/40 rounded-2xl border border-amber-200/50 shadow-sm p-5">
                    <p className="text-xs font-mono text-amber-700 uppercase tracking-widest mb-1">Potential Savings</p>
                    <p ref={savingsRef} className="text-3xl font-heading font-bold text-amber-600">$0</p>
                    <p className="text-xs text-amber-700/70 mt-1">{savingsPercent}% of current spend recoverable</p>
                </div>
                <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-5">
                    <p className="text-xs font-mono text-sbos-slate uppercase tracking-widest mb-1">Leaks Found</p>
                    <p className="text-3xl font-heading font-bold text-sbos-navy">{data.leaks.length}</p>
                    <p className="text-xs text-sbos-slate mt-1">
                        {data.leaks.filter(l => l.severity === 'critical' || l.severity === 'high').length} high priority
                    </p>
                </div>
            </div>

            {/* Spend by Category */}
            <div className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-6">
                <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest mb-5">Spend by Category</p>
                <div className="space-y-3">
                    {data.spendByCategory
                        .sort((a, b) => b.amount - a.amount)
                        .map((cat) => (
                            <div key={cat.category} className="flex items-center gap-4">
                                <span className="text-sm text-sbos-navy font-medium w-40 flex-shrink-0 truncate">{cat.category}</span>
                                <div className="flex-1 h-3 bg-sbos-navy/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sbos-electric/70 rounded-full transition-all duration-700"
                                        style={{ width: `${(cat.amount / maxCategorySpend) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-mono font-bold text-sbos-navy w-20 text-right">
                                    ${cat.amount.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-mono text-sbos-slate w-16 text-right">
                                    {cat.tools} tool{cat.tools !== 1 ? 's' : ''}
                                </span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Leaks List */}
            <div>
                <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest mb-4 px-1">Identified Leaks</p>
                <div className="space-y-4">
                    {data.leaks.map((leak, idx) => {
                        const sev = severityConfig[leak.severity];
                        const TypeIcon = typeIcons[leak.type] || AlertCircle;
                        return (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl border border-sbos-navy/5 shadow-sm p-5 hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: sev.bg }}
                                    >
                                        <TypeIcon size={18} style={{ color: sev.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: sev.bg, color: sev.color }}
                                            >
                                                {sev.label}
                                            </span>
                                            <span className="text-xs font-mono text-sbos-slate capitalize">{leak.type}</span>
                                            {leak.category && (
                                                <span className="text-xs text-sbos-slate/60">• {leak.category}</span>
                                            )}
                                        </div>
                                        {leak.tools ? (
                                            <p className="text-sm font-semibold text-sbos-navy mb-1">
                                                {leak.tools.join(' ↔ ')}
                                            </p>
                                        ) : (
                                            <p className="text-sm font-semibold text-sbos-navy mb-1">
                                                {leak.tool} — <span className="font-mono">${leak.monthlyCost}/mo</span>
                                            </p>
                                        )}
                                        {leak.usage && (
                                            <p className="text-xs text-sbos-slate mb-1">{leak.usage}</p>
                                        )}
                                        <p className="text-sm text-sbos-slate leading-relaxed">
                                            {leak.recommendation}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-1 text-emerald-600">
                                            <ArrowDown size={14} />
                                            <span className="text-lg font-heading font-bold">${leak.monthlySavings}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-sbos-slate">/month</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MoneyLeaksModule;
