import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Target, Clock, ArrowRight, CheckCircle2, Circle, Presentation, Loader2, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
import { sendExecutionPayload, pollForGammaEmbed, isWebhookConfigured, isStatusWebhookConfigured } from '../../services/webhookService';

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

const GENERATION_STAGES = [
    'Sending growth plan data to Gamma…',
    'Building slide structure…',
    'Generating visuals and charts…',
    'Polishing layout and design…',
    'Almost there — finalizing deck…',
];

const GrowthPlanModule = ({ data, recipientEmail, branding, intakeData }) => {
    const [activePhase, setActivePhase] = useState('thirtyDay');

    // Gamma execution state
    const [gammaStatus, setGammaStatus] = useState('idle'); // 'idle' | 'submitting' | 'polling' | 'ready' | 'timeout' | 'error'
    const [embedUrl, setEmbedUrl] = useState(null);
    const [originalUrl, setOriginalUrl] = useState(null); // original /docs/ URL for fallback link
    const [embedFailed, setEmbedFailed] = useState(false); // true if iframe fails to load
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef(null);
    const pollingRef = useRef(false);
    const embedTimeoutRef = useRef(null);

    // Clean up timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (embedTimeoutRef.current) clearTimeout(embedTimeoutRef.current);
        };
    }, []);

    const startTimer = useCallback(() => {
        setElapsedSeconds(0);
        timerRef.current = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentStage = Math.min(Math.floor(elapsedSeconds / 40), GENERATION_STAGES.length - 1);

    // Build comprehensive 30-slide content for the full 90-day growth plan
    const buildSlideContent = () => {
        const companyName = branding?.companyName || 'Your Business';
        const phaseMap = [
            { key: 'thirtyDay', label: '30-Day Plan', range: 'Weeks 1–4', focus: 'Foundation' },
            { key: 'sixtyDay', label: '60-Day Plan', range: 'Weeks 5–8', focus: 'Optimization' },
            { key: 'ninetyDay', label: '90-Day Plan', range: 'Weeks 9–12', focus: 'Scale' },
        ];

        const effortMap = { low: 'Low Effort', medium: 'Medium Effort', high: 'High Effort' };
        const impactMap = { low: 'Low Impact', medium: 'Medium Impact', high: 'High Impact' };

        // Collect all priorities for quick-wins and metrics analysis
        const allPriorities = phaseMap.flatMap(phase =>
            (data[phase.key]?.priorities || []).map(p => ({ ...p, phase: phase.label, range: phase.range }))
        );
        const quickWins = allPriorities.filter(p => p.effort === 'low' && (p.impact === 'high' || p.impact === 'medium'));
        const highImpact = allPriorities.filter(p => p.impact === 'high');

        let slideNum = 1;
        let slides = '';

        // ── SLIDE 1: Title
        slides += `SLIDE ${slideNum++} — TITLE SLIDE\n`;
        slides += `Title: "90-Day Growth Plan for ${companyName}"\n`;
        slides += `Subtitle: A structured roadmap to fix operations, reduce waste, and build scalable systems.\n`;
        slides += `Visual: Clean branded cover with company name and the 30 / 60 / 90 day milestone markers.\n\n`;

        // ── SLIDE 2: Executive Summary
        slides += `SLIDE ${slideNum++} — EXECUTIVE SUMMARY\n`;
        slides += `Title: "What This Plan Covers"\n`;
        slides += `• ${allPriorities.length} prioritized action items across 3 phases\n`;
        phaseMap.forEach(phase => {
            const pd = data[phase.key];
            if (pd) slides += `• ${phase.label} (${phase.range}): ${pd.theme} — ${pd.priorities.length} priorities\n`;
        });
        slides += `• Each action includes effort level, expected impact, and the issue it addresses\n`;
        slides += `• Built from your operational diagnostic, money leak analysis, and business goals\n\n`;

        // ── SLIDE 3: Current State Snapshot
        slides += `SLIDE ${slideNum++} — CURRENT STATE SNAPSHOT\n`;
        slides += `Title: "Where ${companyName} Is Today"\n`;
        if (intakeData?.bottleneck) slides += `• Biggest bottleneck: ${intakeData.bottleneck}\n`;
        if (intakeData?.goals?.length) slides += `• Top goals: ${intakeData.goals.join(', ')}\n`;
        if (intakeData?.teamSize) slides += `• Team size: ${intakeData.teamSize} people\n`;
        if (intakeData?.revenueRange) slides += `• Revenue range: ${intakeData.revenueRange}\n`;
        slides += `• This plan addresses the gaps identified in the SBOS diagnostic and money leak analysis\n`;
        slides += `Visual: Summary dashboard showing key metrics and pain points.\n\n`;

        // ── SLIDE 4: Roadmap Overview
        slides += `SLIDE ${slideNum++} — ROADMAP OVERVIEW\n`;
        slides += `Title: "Your 90-Day Roadmap at a Glance"\n`;
        phaseMap.forEach(phase => {
            const pd = data[phase.key];
            if (pd) slides += `• ${phase.label} (${phase.range}): "${pd.theme}" — ${pd.priorities.length} action items\n`;
        });
        slides += `Visual: Horizontal timeline showing the three phases with milestone markers at Day 30, 60, and 90.\n\n`;

        // ── SLIDE 5: Quick Wins
        slides += `SLIDE ${slideNum++} — QUICK WINS\n`;
        slides += `Title: "Immediate Opportunities — Low Effort, High Return"\n`;
        slides += `These are the actions that deliver the most value with the least disruption. Start here.\n`;
        if (quickWins.length > 0) {
            quickWins.forEach(item => {
                slides += `• ${item.task} (${item.phase}, Week ${item.weekTarget}) — ${impactMap[item.impact]}, ${effortMap[item.effort]}\n`;
            });
        } else {
            allPriorities.filter(p => p.effort === 'low').forEach(item => {
                slides += `• ${item.task} (${item.phase}, Week ${item.weekTarget})\n`;
            });
        }
        slides += `Visual: Highlighted cards for each quick win with effort/impact badges.\n\n`;

        // ── PHASE 1 SLIDES (30-Day) ──
        const thirtyData = data.thirtyDay;
        if (thirtyData) {
            const sorted30 = [...thirtyData.priorities].sort((a, b) => a.weekTarget - b.weekTarget);

            // SLIDE 6: Phase 1 Intro
            slides += `SLIDE ${slideNum++} — PHASE 1 INTRO: 30-DAY PLAN\n`;
            slides += `Title: "Foundation — ${thirtyData.theme}"\n`;
            slides += `Timeframe: Weeks 1–4\n`;
            slides += `Focus: Stop the bleeding. Eliminate waste, consolidate tools, and document the most critical processes.\n`;
            slides += `Number of priorities: ${sorted30.length}\n`;
            slides += `Visual: Large "30" with phase theme and priority count.\n\n`;

            // Individual priority slides
            sorted30.forEach((item, idx) => {
                slides += `SLIDE ${slideNum++} — 30-DAY PLAN / PRIORITY ${idx + 1}\n`;
                slides += `Title: "${item.task}"\n`;
                slides += `Target: Week ${item.weekTarget}\n`;
                slides += `Effort: ${effortMap[item.effort] || item.effort}\n`;
                slides += `Impact: ${impactMap[item.impact] || item.impact}\n`;
                slides += `Addresses: ${item.addressesIssue}\n`;
                slides += `Why this matters: This action directly addresses "${item.addressesIssue}" and should be completed by Week ${item.weekTarget}.\n`;
                slides += `Recommended steps:\n`;
                slides += `  1. Assess the current state of this area\n`;
                slides += `  2. Define the desired outcome and success criteria\n`;
                slides += `  3. Assign ownership and set the Week ${item.weekTarget} deadline\n`;
                slides += `  4. Execute and verify the result\n`;
                slides += `Visual: Action card with effort/impact badges and timeline indicator at Week ${item.weekTarget}.\n\n`;
            });

            // Phase 1 Summary
            slides += `SLIDE ${slideNum++} — 30-DAY SUMMARY & MILESTONES\n`;
            slides += `Title: "30-Day Checkpoint — What Success Looks Like"\n`;
            sorted30.forEach((item, idx) => {
                slides += `✓ Priority ${idx + 1}: ${item.task} — completed by Week ${item.weekTarget}\n`;
            });
            slides += `Milestone: By the end of Week 4, ${companyName} should have ${thirtyData.theme.toLowerCase()} fully addressed.\n`;
            slides += `Visual: Checklist graphic showing all priorities with checkmarks.\n\n`;
        }

        // ── TRANSITION SLIDE: 30 → 60
        slides += `SLIDE ${slideNum++} — PHASE TRANSITION: DAY 30 → DAY 60\n`;
        slides += `Title: "Foundation Complete — Now Optimize"\n`;
        slides += `What you accomplished: Eliminated waste, consolidated duplicate tools, and documented your first SOPs.\n`;
        slides += `What's next: Build on this foundation by standardizing systems, expanding process documentation, and streamlining communication.\n`;
        slides += `Visual: Progress bar showing Phase 1 complete, Phase 2 starting.\n\n`;

        // ── PHASE 2 SLIDES (60-Day) ──
        const sixtyData = data.sixtyDay;
        if (sixtyData) {
            const sorted60 = [...sixtyData.priorities].sort((a, b) => a.weekTarget - b.weekTarget);

            // Phase 2 Intro
            slides += `SLIDE ${slideNum++} — PHASE 2 INTRO: 60-DAY PLAN\n`;
            slides += `Title: "Optimization — ${sixtyData.theme}"\n`;
            slides += `Timeframe: Weeks 5–8\n`;
            slides += `Focus: Build reliable systems. Standardize operations, create repeatable processes, and reduce team friction.\n`;
            slides += `Number of priorities: ${sorted60.length}\n`;
            slides += `Visual: Large "60" with phase theme and priority count.\n\n`;

            // Individual priority slides
            sorted60.forEach((item, idx) => {
                slides += `SLIDE ${slideNum++} — 60-DAY PLAN / PRIORITY ${idx + 1}\n`;
                slides += `Title: "${item.task}"\n`;
                slides += `Target: Week ${item.weekTarget}\n`;
                slides += `Effort: ${effortMap[item.effort] || item.effort}\n`;
                slides += `Impact: ${impactMap[item.impact] || item.impact}\n`;
                slides += `Addresses: ${item.addressesIssue}\n`;
                slides += `Why this matters: This action directly addresses "${item.addressesIssue}" and should be completed by Week ${item.weekTarget}.\n`;
                slides += `Recommended steps:\n`;
                slides += `  1. Assess the current state of this area\n`;
                slides += `  2. Define the desired outcome and success criteria\n`;
                slides += `  3. Assign ownership and set the Week ${item.weekTarget} deadline\n`;
                slides += `  4. Execute and verify the result\n`;
                slides += `Visual: Action card with effort/impact badges and timeline indicator at Week ${item.weekTarget}.\n\n`;
            });

            // Phase 2 Summary
            slides += `SLIDE ${slideNum++} — 60-DAY SUMMARY & MILESTONES\n`;
            slides += `Title: "60-Day Checkpoint — What Success Looks Like"\n`;
            sorted60.forEach((item, idx) => {
                slides += `✓ Priority ${idx + 1}: ${item.task} — completed by Week ${item.weekTarget}\n`;
            });
            slides += `Milestone: By the end of Week 8, ${companyName} should have ${sixtyData.theme.toLowerCase()} fully addressed.\n`;
            slides += `Visual: Checklist graphic showing all priorities with checkmarks.\n\n`;
        }

        // ── TRANSITION SLIDE: 60 → 90
        slides += `SLIDE ${slideNum++} — PHASE TRANSITION: DAY 60 → DAY 90\n`;
        slides += `Title: "Systems in Place — Now Scale"\n`;
        slides += `What you accomplished: Standardized core tools, documented key processes, and streamlined team communication.\n`;
        slides += `What's next: Automate follow-up, implement ongoing health monitoring, and build scalable client workflows.\n`;
        slides += `Visual: Progress bar showing Phase 1 and 2 complete, Phase 3 starting.\n\n`;

        // ── PHASE 3 SLIDES (90-Day) ──
        const ninetyData = data.ninetyDay;
        if (ninetyData) {
            const sorted90 = [...ninetyData.priorities].sort((a, b) => a.weekTarget - b.weekTarget);

            // Phase 3 Intro
            slides += `SLIDE ${slideNum++} — PHASE 3 INTRO: 90-DAY PLAN\n`;
            slides += `Title: "Scale — ${ninetyData.theme}"\n`;
            slides += `Timeframe: Weeks 9–12\n`;
            slides += `Focus: Automate and grow. Implement automation, build monitoring, and create scalable onboarding.\n`;
            slides += `Number of priorities: ${sorted90.length}\n`;
            slides += `Visual: Large "90" with phase theme and priority count.\n\n`;

            // Individual priority slides
            sorted90.forEach((item, idx) => {
                slides += `SLIDE ${slideNum++} — 90-DAY PLAN / PRIORITY ${idx + 1}\n`;
                slides += `Title: "${item.task}"\n`;
                slides += `Target: Week ${item.weekTarget}\n`;
                slides += `Effort: ${effortMap[item.effort] || item.effort}\n`;
                slides += `Impact: ${impactMap[item.impact] || item.impact}\n`;
                slides += `Addresses: ${item.addressesIssue}\n`;
                slides += `Why this matters: This action directly addresses "${item.addressesIssue}" and should be completed by Week ${item.weekTarget}.\n`;
                slides += `Recommended steps:\n`;
                slides += `  1. Assess the current state of this area\n`;
                slides += `  2. Define the desired outcome and success criteria\n`;
                slides += `  3. Assign ownership and set the Week ${item.weekTarget} deadline\n`;
                slides += `  4. Execute and verify the result\n`;
                slides += `Visual: Action card with effort/impact badges and timeline indicator at Week ${item.weekTarget}.\n\n`;
            });

            // Phase 3 Summary
            slides += `SLIDE ${slideNum++} — 90-DAY SUMMARY & MILESTONES\n`;
            slides += `Title: "90-Day Checkpoint — What Success Looks Like"\n`;
            sorted90.forEach((item, idx) => {
                slides += `✓ Priority ${idx + 1}: ${item.task} — completed by Week ${item.weekTarget}\n`;
            });
            slides += `Milestone: By the end of Week 12, ${companyName} should have ${ninetyData.theme.toLowerCase()} fully addressed.\n`;
            slides += `Visual: Checklist graphic showing all priorities with checkmarks.\n\n`;
        }

        // ── Full Timeline Slide
        slides += `SLIDE ${slideNum++} — FULL 90-DAY TIMELINE\n`;
        slides += `Title: "Complete Implementation Timeline"\n`;
        phaseMap.forEach(phase => {
            const pd = data[phase.key];
            if (!pd) return;
            [...pd.priorities].sort((a, b) => a.weekTarget - b.weekTarget).forEach(item => {
                slides += `• Week ${item.weekTarget}: ${item.task}\n`;
            });
        });
        slides += `Visual: Gantt-style timeline showing all actions mapped across 12 weeks.\n\n`;

        // ── Key Metrics to Track
        slides += `SLIDE ${slideNum++} — KEY METRICS TO TRACK\n`;
        slides += `Title: "How ${companyName} Will Measure Progress"\n`;
        slides += `• Operational Health Score — run the SBOS diagnostic at Day 30, 60, and 90 to track improvement\n`;
        slides += `• Tool Spend — monthly cost should decrease as redundant subscriptions are eliminated\n`;
        slides += `• Process Documentation — number of SOPs created and adopted by the team\n`;
        slides += `• Lead Follow-Up Rate — percentage of leads receiving timely, consistent follow-up\n`;
        slides += `• Task Completion Rate — percentage of plan priorities completed on schedule\n`;
        slides += `Visual: Dashboard layout with metric cards and target values.\n\n`;

        // ── Resource & Ownership
        slides += `SLIDE ${slideNum++} — RESOURCE & OWNERSHIP PLAN\n`;
        slides += `Title: "Who Owns What"\n`;
        slides += `Every priority in this plan needs a clear owner. Assign one person per action item.\n`;
        slides += `Recommended ownership structure:\n`;
        slides += `• Operations Lead — tool consolidation, SOP creation, process improvements\n`;
        slides += `• Finance Lead — subscription audits, cost tracking, invoicing cleanup\n`;
        slides += `• Sales/Growth Lead — lead follow-up automation, CRM workflows\n`;
        slides += `• Team Lead / Owner — overall accountability, weekly check-ins, milestone reviews\n`;
        slides += `Visual: Org-chart style layout mapping roles to action categories.\n\n`;

        // ── Expected Outcomes
        slides += `SLIDE ${slideNum++} — EXPECTED OUTCOMES\n`;
        slides += `Title: "What ${companyName} Gains After 90 Days"\n`;
        slides += `• Streamlined operations with fewer redundant tools\n`;
        slides += `• Documented, repeatable processes (SOPs) for key workflows\n`;
        slides += `• Automated lead follow-up reducing manual effort\n`;
        slides += `• Clear visibility into business health and performance\n`;
        slides += `• A foundation for sustainable, scalable growth\n`;
        slides += `Visual: Before/after comparison or outcomes dashboard.\n\n`;

        // ── 90-Day Commitment
        slides += `SLIDE ${slideNum++} — YOUR 90-DAY COMMITMENT\n`;
        slides += `Title: "What It Takes to Succeed"\n`;
        slides += `• Dedicate 2–3 hours per week to plan execution\n`;
        slides += `• Hold a 15-minute weekly standup to review progress\n`;
        slides += `• Run the SBOS diagnostic at each 30-day milestone\n`;
        slides += `• Adjust priorities based on what you learn — this plan is a living document\n`;
        slides += `• Start small, stay consistent, and compound improvements over time\n`;
        slides += `Visual: Calendar view showing weekly commitment blocks.\n\n`;

        // ── Next Steps
        slides += `SLIDE ${slideNum++} — NEXT STEPS\n`;
        slides += `Title: "How to Get Started"\n`;
        slides += `1. Review this plan with your team and assign ownership for each priority\n`;
        slides += `2. Start with Week 1 actions — these are designed to be quick wins\n`;
        slides += `3. Use the SBOS diagnostic to track progress at Day 30, 60, and 90\n`;
        slides += `4. Revisit and adjust priorities as you learn what works for your team\n`;
        slides += `Visual: Clean CTA layout with numbered steps.\n\n`;

        // ── Closing
        slides += `SLIDE ${slideNum++} — CLOSING\n`;
        slides += `Title: "Built for ${companyName} by SBOS"\n`;
        slides += `Subtitle: Your 90-day growth plan — from diagnosis to execution.\n`;
        slides += `Visual: Branded closing slide with company name and SBOS logo.\n`;

        return slides;
    };

    // Build additional instructions prompt for Gamma AI agent
    const buildAdditionalInstructions = () => {
        const companyName = branding?.companyName || 'a small business';
        const parts = [`You are making a 90-day growth plan presentation for ${companyName}.`];

        if (intakeData?.revenueRange) {
            parts.push(`They are a ${intakeData.revenueRange} revenue business.`);
        }
        if (intakeData?.teamSize) {
            parts.push(`They have a team of ${intakeData.teamSize} people.`);
        }
        if (intakeData?.goals?.length) {
            parts.push(`Their top goals are: ${intakeData.goals.join(', ')}.`);
        }
        if (intakeData?.bottleneck) {
            parts.push(`Their biggest bottleneck is: ${intakeData.bottleneck}.`);
        }

        parts.push('Make the presentation professional, actionable, and focused on operational improvement. Use clean slide layouts with clear headers and bullet points. Avoid generic corporate language — write for a hands-on business owner.');

        return parts.join(' ');
    };

    const handleGenerateDeck = async () => {
        if (gammaStatus === 'submitting' || gammaStatus === 'polling') return;
        if (pollingRef.current) return;

        setGammaStatus('submitting');
        setEmbedUrl(null);
        setElapsedSeconds(0);

        try {
            // Step 1: Build structured payload and POST to N8N
            const slideContent = buildSlideContent();
            const additionalInstructions = buildAdditionalInstructions();

            await sendExecutionPayload('growth-plan', recipientEmail || '', branding, {
                slideContent,
                additionalInstructions,
                companyName: branding?.companyName || 'SBOS',
            });

            // Step 2: Start polling for Gamma embed
            setGammaStatus('polling');
            startTimer();
            pollingRef.current = true;

            const url = await pollForGammaEmbed((status) => {
                // onStatusUpdate callback — we already have the timer running
            });

            stopTimer();
            pollingRef.current = false;

            if (url) {
                // Store original URL for fallback link
                setOriginalUrl(url);
                // Convert /docs/ to /embed/ for iframe compatibility
                const embedSafeUrl = url.replace('/docs/', '/embed/');
                setEmbedUrl(embedSafeUrl);
                setEmbedFailed(false);
                setGammaStatus('ready');

                // Set a fallback timeout — if iframe doesn't load in 5s, show fallback
                embedTimeoutRef.current = setTimeout(() => {
                    setEmbedFailed(true);
                }, 5000);
            } else {
                setGammaStatus('timeout');
            }
        } catch (err) {
            console.error('[GrowthPlanModule] Gamma generation failed:', err);
            stopTimer();
            pollingRef.current = false;
            setGammaStatus('error');
        }
    };

    const handleRetry = () => {
        setGammaStatus('idle');
        setEmbedUrl(null);
        setOriginalUrl(null);
        setEmbedFailed(false);
        setElapsedSeconds(0);
        if (embedTimeoutRef.current) clearTimeout(embedTimeoutRef.current);
    };

    // Called when iframe successfully loads — cancel the fallback timeout
    const handleEmbedLoad = () => {
        if (embedTimeoutRef.current) {
            clearTimeout(embedTimeoutRef.current);
            embedTimeoutRef.current = null;
        }
        setEmbedFailed(false);
    };

    // Called when iframe fails to load
    const handleEmbedError = () => {
        if (embedTimeoutRef.current) {
            clearTimeout(embedTimeoutRef.current);
            embedTimeoutRef.current = null;
        }
        setEmbedFailed(true);
    };

    if (!data) return null;

    const currentPhase = phases.find(p => p.key === activePhase);
    const phaseData = data[activePhase];

    return (
        <div className="space-y-6">
            {/* ═══════════ EXECUTION LAYER: Gamma Presentation ═══════════ */}
            {isWebhookConfigured() && (
                <div
                    className="rounded-2xl border shadow-sm overflow-hidden transition-all duration-300"
                    style={{
                        borderColor: gammaStatus === 'ready' ? '#18C37E40'
                            : gammaStatus === 'polling' ? '#8B5CF640'
                                : '#8B5CF620',
                        backgroundColor: gammaStatus === 'ready' ? '#18C37E08' : '#ffffff',
                    }}
                >
                    {/* Card Header */}
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: gammaStatus === 'ready' ? '#18C37E15'
                                        : gammaStatus === 'polling' || gammaStatus === 'submitting' ? '#8B5CF620'
                                            : '#8B5CF615',
                                }}
                            >
                                {gammaStatus === 'ready' ? (
                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                ) : gammaStatus === 'polling' || gammaStatus === 'submitting' ? (
                                    <Loader2 size={20} className="text-violet-500 animate-spin" />
                                ) : gammaStatus === 'timeout' || gammaStatus === 'error' ? (
                                    <AlertTriangle size={20} className="text-amber-500" />
                                ) : (
                                    <Presentation size={20} className="text-violet-500" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-sbos-navy">
                                    {gammaStatus === 'ready' ? 'Presentation deck ready!'
                                        : gammaStatus === 'polling' ? 'Generating your presentation…'
                                            : gammaStatus === 'submitting' ? 'Sending data to Gamma…'
                                                : gammaStatus === 'timeout' ? 'Generation is taking longer than expected'
                                                    : gammaStatus === 'error' ? 'Something went wrong'
                                                        : 'Generate Presentation Deck'}
                                </h3>
                                <p className="text-xs text-sbos-slate mt-0.5 leading-relaxed">
                                    {gammaStatus === 'ready' ? 'Your growth plan has been converted into a shareable slide deck via Gamma.'
                                        : gammaStatus === 'polling' ? GENERATION_STAGES[currentStage]
                                            : gammaStatus === 'submitting' ? 'Preparing your growth plan data…'
                                                : gammaStatus === 'timeout' ? 'The presentation is still being generated. It may appear shortly — check back in a minute.'
                                                    : gammaStatus === 'error' ? 'The presentation generation failed. Please try again.'
                                                        : 'Turn your 30/60/90 growth roadmap into a polished Gamma presentation deck.'}
                                </p>

                                {/* Elapsed Timer */}
                                {(gammaStatus === 'polling' || gammaStatus === 'submitting') && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex-1 h-1.5 bg-sbos-navy/[0.04] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-linear"
                                                style={{
                                                    width: `${Math.min((elapsedSeconds / 240) * 100, 95)}%`,
                                                    background: 'linear-gradient(90deg, #8B5CF6, #3366FF)',
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-sbos-slate flex-shrink-0">
                                            {formatTime(elapsedSeconds)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {gammaStatus === 'idle' && (
                                <button
                                    onClick={handleGenerateDeck}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex-shrink-0"
                                    style={{ backgroundColor: branding?.primaryColor || '#2C3FB8' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <Presentation size={14} />
                                    Generate Deck
                                </button>
                            )}
                            {(gammaStatus === 'timeout' || gammaStatus === 'error') && (
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex-shrink-0 bg-amber-500"
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <RefreshCw size={14} />
                                    Try Again
                                </button>
                            )}
                            {gammaStatus === 'ready' && (originalUrl || embedUrl) && (
                                <a
                                    href={originalUrl || embedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 flex-shrink-0"
                                    style={{ backgroundColor: '#18C37E' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <ExternalLink size={14} />
                                    Open in Gamma
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Loading skeleton */}
                    {(gammaStatus === 'polling' || gammaStatus === 'submitting') && (
                        <div className="px-6 pb-6">
                            <div className="bg-sbos-cloud/40 rounded-xl p-4 border border-sbos-navy/[0.03] space-y-3">
                                <div className="h-4 bg-sbos-navy/[0.06] rounded-lg w-3/4 animate-pulse" />
                                <div className="h-3 bg-sbos-navy/[0.04] rounded-lg w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                <div className="h-3 bg-sbos-navy/[0.04] rounded-lg w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    <div className="h-16 bg-sbos-navy/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '0.3s' }} />
                                    <div className="h-16 bg-sbos-navy/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    <div className="h-16 bg-sbos-navy/[0.04] rounded-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gamma Embed iframe or Fallback */}
                    {gammaStatus === 'ready' && embedUrl && (
                        <div className="px-6 pb-6">
                            {!embedFailed ? (
                                /* Try iframe embed first */
                                <div className="rounded-xl overflow-hidden border border-sbos-navy/10 shadow-sm">
                                    <iframe
                                        src={embedUrl}
                                        title="Growth Plan Presentation"
                                        width="100%"
                                        height="450"
                                        frameBorder="0"
                                        allow="fullscreen"
                                        className="block"
                                        style={{ minHeight: '450px' }}
                                        onLoad={handleEmbedLoad}
                                        onError={handleEmbedError}
                                    />
                                </div>
                            ) : (
                                /* Fallback: prominent Open in Gamma card */
                                <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-8 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                        <Presentation size={28} className="text-violet-500" />
                                    </div>
                                    <h4 className="text-base font-heading font-bold text-sbos-navy mb-1">
                                        Your presentation is ready!
                                    </h4>
                                    <p className="text-sm text-sbos-slate mb-5 max-w-md mx-auto">
                                        The deck was generated successfully but can't be previewed here. Click below to view it directly in Gamma.
                                    </p>
                                    <a
                                        href={originalUrl || embedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                                        style={{ backgroundColor: branding?.primaryColor || '#2C3FB8' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <ExternalLink size={16} />
                                        Open Presentation in Gamma
                                    </a>
                                </div>
                            )}
                            <p className="text-[10px] text-sbos-slate mt-2 text-center">
                                Powered by Gamma • 30/60/90 Growth Roadmap for {branding?.companyName || 'your business'}
                            </p>
                        </div>
                    )}
                </div>
            )}

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

