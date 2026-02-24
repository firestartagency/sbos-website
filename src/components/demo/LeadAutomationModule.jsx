import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, ChevronDown, ChevronUp, Target, BarChart3, Users, Send, Loader2, CheckCircle2, Building2, Globe, Sparkles } from 'lucide-react';
import { sendExecutionPayload, isWebhookConfigured } from '../../services/webhookService';
import { buildEmailHtml } from '../../services/emailTemplates';

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

const statusBadges = {
    new: { label: 'New', color: '#3366FF', bg: '#3366FF12' },
    'email-sent': { label: 'Email Sent', color: '#18C37E', bg: '#18C37E12' },
    sending: { label: 'Sending…', color: '#F5A524', bg: '#F5A52412' },
    error: { label: 'Error', color: '#EF4444', bg: '#EF444412' },
};

const LeadAutomationModule = ({ data, recipientEmail, branding }) => {
    const [expandedTouch, setExpandedTouch] = useState(0);
    const [showCrm, setShowCrm] = useState(false);
    const [clientStatuses, setClientStatuses] = useState({}); // { [idx]: 'new'|'sending'|'email-sent'|'error' }

    if (!data) return null;

    const clients = data.dummyClients || [];
    const firstTouch = data.touches?.[0];

    const toggleTouch = (idx) => {
        setExpandedTouch(prev => prev === idx ? -1 : idx);
    };

    const handleSendFirstEmail = async (clientIdx) => {
        const client = clients[clientIdx];
        if (!client || clientStatuses[clientIdx] === 'sending') return;

        setClientStatuses(prev => ({ ...prev, [clientIdx]: 'sending' }));

        try {
            // Personalize the first touch message body
            const personalizedBody = (firstTouch?.body || '')
                .replace(/\{\{name\}\}/g, client.name.split(' ')[0])
                .replace(/\{\{company\}\}/g, client.company)
                .replace(/\{\{sender\}\}/g, branding?.companyName || 'SBOS');

            const emailHtml = buildEmailHtml('lead-email', {
                subject: (firstTouch?.subject || 'Hello from {{company}}')
                    .replace(/\{\{name\}\}/g, client.name.split(' ')[0])
                    .replace(/\{\{company\}\}/g, client.company),
                body: personalizedBody,
                clientName: client.name,
                clientCompany: client.company,
            }, branding);

            const subject = (firstTouch?.subject || `Hello from ${branding?.companyName}`)
                .replace(/\{\{name\}\}/g, client.name.split(' ')[0])
                .replace(/\{\{company\}\}/g, client.company);

            // Use the demo recipient email (not the dummy client email) for actual delivery
            await sendExecutionPayload('lead-email', recipientEmail || client.email, branding, {
                emailHtml,
                subject,
                clientName: client.name,
                clientCompany: client.company,
                clientEmail: client.email,
            });

            setClientStatuses(prev => ({ ...prev, [clientIdx]: 'email-sent' }));
        } catch (err) {
            console.error('[LeadAutomationModule] Send failed:', err);
            setClientStatuses(prev => ({ ...prev, [clientIdx]: 'error' }));
        }
    };

    return (
        <div className="space-y-6">
            {/* ═══════════ EXECUTION LAYER: Demo CRM ═══════════ */}
            {isWebhookConfigured() && clients.length > 0 && (
                <div className="rounded-2xl border border-pink-200/50 shadow-sm overflow-hidden bg-white">
                    {/* CRM Toggle Header */}
                    <button
                        onClick={() => setShowCrm(!showCrm)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-sbos-cloud/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                <Users size={20} className="text-pink-500" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-semibold text-sbos-navy">Demo CRM</h3>
                                <p className="text-xs text-sbos-slate">
                                    {clients.length} leads • Send the first touchpoint email
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 text-pink-500 font-semibold">
                                DEMO DATA
                            </span>
                            {showCrm ? <ChevronUp size={16} className="text-sbos-slate" /> : <ChevronDown size={16} className="text-sbos-slate" />}
                        </div>
                    </button>

                    {/* CRM Client Cards */}
                    {showCrm && (
                        <div className="px-6 pb-6 space-y-3">
                            <p className="text-[10px] text-sbos-slate mb-2">
                                These are AI-generated sample leads. Click "Send First Email" to trigger the Day 0 welcome message via N8N.
                                {recipientEmail && <span className="font-medium"> Emails will be delivered to <span className="text-sbos-navy">{recipientEmail}</span>.</span>}
                            </p>

                            {clients.map((client, idx) => {
                                const status = clientStatuses[idx] || client.status || 'new';
                                const badge = statusBadges[status] || statusBadges.new;
                                const isFeatured = idx === 0;

                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border p-4 transition-all duration-300 ${status === 'email-sent'
                                            ? 'border-emerald-200 bg-emerald-50/30'
                                            : isFeatured
                                                ? 'border-pink-200 bg-pink-50/20'
                                                : 'border-sbos-navy/5 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                style={{ backgroundColor: branding?.primaryColor || '#2C3FB8' }}
                                            >
                                                {client.name.split(' ').map(n => n[0]).join('')}
                                            </div>

                                            {/* Client Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold text-sbos-navy">{client.name}</span>
                                                    <span
                                                        className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                                                        style={{ backgroundColor: badge.bg, color: badge.color }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                    {isFeatured && status === 'new' && (
                                                        <span className="text-[10px] font-semibold text-pink-500 flex items-center gap-0.5">
                                                            <Sparkles size={10} /> Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-sbos-slate">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 size={10} />
                                                        {client.company}
                                                    </span>
                                                    <span className="text-sbos-navy/10">|</span>
                                                    <span>{client.industry}</span>
                                                </div>
                                                <p className="text-xs text-sbos-slate mt-1.5 leading-relaxed">{client.goals}</p>
                                                {client.notes && (
                                                    <p className="text-[10px] text-sbos-slate/70 mt-1 italic flex items-center gap-1">
                                                        <Sparkles size={9} className="text-sbos-electric" />
                                                        {client.notes}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Send Button */}
                                            <button
                                                onClick={() => handleSendFirstEmail(idx)}
                                                disabled={status === 'sending' || status === 'email-sent' || (!recipientEmail && !client.email)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold text-white transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundColor: status === 'email-sent' ? '#18C37E'
                                                        : status === 'error' ? '#EF4444'
                                                            : (branding?.primaryColor || '#2C3FB8'),
                                                }}
                                                onMouseEnter={(e) => { if (status === 'new' || status === 'error') e.currentTarget.style.transform = 'scale(1.03)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                            >
                                                {status === 'sending' && <Loader2 size={12} className="animate-spin" />}
                                                {status === 'email-sent' && <CheckCircle2 size={12} />}
                                                {(status === 'new' || status === 'error') && <Send size={12} />}
                                                {status === 'sending' ? 'Sending…'
                                                    : status === 'email-sent' ? 'Sent ✓'
                                                        : status === 'error' ? 'Retry'
                                                            : 'Send First Email'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

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

