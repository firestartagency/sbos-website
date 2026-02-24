import React, { useState } from 'react';
import { FileText, User, Clock, Wrench, ChevronDown, ChevronUp, Download, Copy, Mail, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { sendExecutionPayload, isWebhookConfigured } from '../../services/webhookService';
import { buildEmailHtml } from '../../services/emailTemplates';

const roleColors = {
    'Sales': '#3366FF',
    'Operations': '#18C37E',
    'Account Manager': '#8B5CF6',
    'Finance': '#F5A524',
    'Admin': '#6B7280',
};

const getRoleColor = (role) => roleColors[role] || '#6B7280';

const SopBuilderModule = ({ data, recipientEmail, branding }) => {
    const [activeSop, setActiveSop] = useState(0);
    const [expandedSteps, setExpandedSteps] = useState({});

    // Execution layer state — per-SOP
    const [clientEmails, setClientEmails] = useState({}); // { [sopIdx]: email }
    const [sendStatuses, setSendStatuses] = useState({}); // { [sopIdx]: 'idle'|'sending'|'sent'|'error' }
    const [sentToEmails, setSentToEmails] = useState({}); // { [sopIdx]: email } — track who it was sent to

    if (!data || !data.sops) return null;

    const sop = data.sops[activeSop];
    const sendStatus = sendStatuses[activeSop] || 'idle';
    const clientEmail = clientEmails[activeSop] || '';

    const handleSendSop = async () => {
        const emailToUse = clientEmail.trim() || recipientEmail;
        if (!emailToUse || sendStatus === 'sending') return;

        setSendStatuses(prev => ({ ...prev, [activeSop]: 'sending' }));
        try {
            const emailHtml = buildEmailHtml('sop-delivery', {
                sopTitle: sop.title,
                steps: sop.steps,
                owner: sop.owner,
                frequency: sop.frequency,
                estimatedTime: sop.estimatedTime,
            }, branding);
            const subject = `SOP: ${sop.title} — ${branding.companyName}`;

            await sendExecutionPayload('sop-delivery', emailToUse, branding, {
                emailHtml,
                subject,
                sopTitle: sop.title,
            });

            setSendStatuses(prev => ({ ...prev, [activeSop]: 'sent' }));
            setSentToEmails(prev => ({ ...prev, [activeSop]: emailToUse }));
        } catch (err) {
            console.error('[SopBuilderModule] Send failed:', err);
            setSendStatuses(prev => ({ ...prev, [activeSop]: 'error' }));
        }
    };

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
                        {sendStatuses[idx] === 'sent' && (
                            <CheckCircle2 size={12} className="text-emerald-300" />
                        )}
                    </button>
                ))}
            </div>

            {/* ═══════════ EXECUTION LAYER: Send SOP to Client ═══════════ */}
            {isWebhookConfigured() && (
                <div
                    className="rounded-2xl border shadow-sm p-6 transition-all duration-300"
                    style={{
                        borderColor: sendStatus === 'sent' ? '#18C37E40' : '#8B5CF630',
                        backgroundColor: sendStatus === 'sent' ? '#18C37E08' : '#ffffff',
                    }}
                >
                    <div className="flex items-start gap-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: sendStatus === 'sent' ? '#18C37E15' : '#8B5CF615',
                            }}
                        >
                            {sendStatus === 'sent' ? (
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                                <Mail size={20} className="text-violet-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-sbos-navy">
                                {sendStatus === 'sent'
                                    ? `"${sop.title}" sent!`
                                    : `Send "${sop.title}" to a client`}
                            </h3>
                            <p className="text-xs text-sbos-slate mt-0.5 leading-relaxed">
                                {sendStatus === 'sent'
                                    ? `SOP delivered to ${sentToEmails[activeSop]}. Check their inbox.`
                                    : 'Deliver this SOP as a branded email. Enter a client email or leave blank to send to yourself.'}
                            </p>

                            {sendStatus === 'error' && (
                                <p className="text-xs text-red-500 mt-1.5 font-medium">
                                    Something went wrong. Please try again.
                                </p>
                            )}

                            {/* Client email input + send row */}
                            {sendStatus !== 'sent' && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="relative flex-1">
                                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sbos-slate/40" />
                                        <input
                                            type="email"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmails(prev => ({ ...prev, [activeSop]: e.target.value }))}
                                            placeholder={recipientEmail || 'client@company.com'}
                                            className="w-full pl-9 pr-3 py-2 text-xs bg-sbos-cloud/50 rounded-lg border border-sbos-navy/10 text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric/40 focus:ring-1 focus:ring-sbos-electric/10 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendSop}
                                        disabled={sendStatus === 'sending' || (!clientEmail.trim() && !recipientEmail)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: branding?.primaryColor || '#2C3FB8' }}
                                        onMouseEnter={(e) => { if (sendStatus !== 'sending') e.currentTarget.style.transform = 'scale(1.03)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        {sendStatus === 'sending' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                        {sendStatus === 'sending' ? 'Sending...' : sendStatus === 'error' ? 'Retry' : 'Send SOP'}
                                    </button>
                                </div>
                            )}

                            {/* Resend option after sent */}
                            {sendStatus === 'sent' && (
                                <button
                                    onClick={() => setSendStatuses(prev => ({ ...prev, [activeSop]: 'idle' }))}
                                    className="text-xs text-sbos-electric font-semibold mt-2 hover:underline"
                                >
                                    Send to another recipient →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

