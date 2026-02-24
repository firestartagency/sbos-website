import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
    Activity, DollarSign, TrendingUp, FileText, Mail,
    ArrowLeft, ChevronRight, Building2, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';


import { useTheme } from '../context/ThemeContext';
import { runAnalysis, isApiKeyConfigured } from '../services/geminiAgents';

import DiagnosticModule from '../components/demo/DiagnosticModule';
import MoneyLeaksModule from '../components/demo/MoneyLeaksModule';
import GrowthPlanModule from '../components/demo/GrowthPlanModule';
import SopBuilderModule from '../components/demo/SopBuilderModule';
import LeadAutomationModule from '../components/demo/LeadAutomationModule';
import AIChatWidget from '../components/demo/AIChatWidget';

import {
    mockDiagnostic, mockMoneyLeaks, mockGrowthPlan,
    mockSops, mockLeadAutomation
} from '../data/mockDemoData';

const modules = [
    { id: 'diagnostic', name: 'Health Diagnostic', icon: Activity, color: '#18C37E', dataKey: 'diagnostic' },
    { id: 'money-leaks', name: 'Money Leaks', icon: DollarSign, color: '#F5A524', dataKey: 'moneyLeaks' },
    { id: 'growth-plan', name: 'Growth Plan', icon: TrendingUp, color: '#3366FF', dataKey: 'growthPlan' },
    { id: 'sop-builder', name: 'SOP Builder', icon: FileText, color: '#8B5CF6', dataKey: 'sops' },
    { id: 'lead-auto', name: 'Lead Automation', icon: Mail, color: '#EC4899', dataKey: 'leadAutomation' },
];

const DemoResults = () => {
    const [activeTab, setActiveTab] = useState('diagnostic');
    const [moduleData, setModuleData] = useState({});
    const [moduleStatus, setModuleStatus] = useState({}); // 'loading' | 'done' | 'error'
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    const contentRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const intakeData = location.state?.intakeData;

    // On mount: run analysis or load sample data
    useEffect(() => {
        if (intakeData && isApiKeyConfigured()) {
            // Real Gemini analysis
            setIsAnalyzing(true);
            setUsingSample(false);

            // Set all modules to loading
            const initialStatus = {};
            modules.forEach(m => { initialStatus[m.id] = 'loading'; });
            setModuleStatus(initialStatus);

            runAnalysis(intakeData, (moduleId, data) => {
                // Progressive callback — each module updates as it completes
                setModuleData(prev => ({ ...prev, [moduleId]: data }));
                setModuleStatus(prev => ({ ...prev, [moduleId]: 'done' }));

                // Auto-switch to first completed module
                setActiveTab(prev => {
                    const currentModuleData = modules.find(m => m.id === prev);
                    if (!currentModuleData) return moduleId;
                    return prev;
                });
            }).then((allResults) => {
                setIsAnalyzing(false);
                // Mark any unfinished modules as errors
                setModuleStatus(prev => {
                    const updated = { ...prev };
                    modules.forEach(m => {
                        if (updated[m.id] === 'loading') updated[m.id] = 'error';
                    });
                    return updated;
                });
            }).catch(err => {
                console.error('Analysis failed:', err);
                setIsAnalyzing(false);
            });
        } else {
            // No intake data or no API key — load sample data
            setUsingSample(true);
            setModuleData({
                diagnostic: mockDiagnostic,
                'money-leaks': mockMoneyLeaks,
                'growth-plan': mockGrowthPlan,
                'sop-builder': mockSops,
                'lead-auto': mockLeadAutomation,
            });
            const doneStatus = {};
            modules.forEach(m => { doneStatus[m.id] = 'done'; });
            setModuleStatus(doneStatus);
        }
    }, []);

    // Animate content when tab changes
    useEffect(() => {
        if (!contentRef.current) return;
        gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
    }, [activeTab]);

    const getModuleData = (moduleId) => {
        // Map from module tab IDs to the actual data keys
        return moduleData[moduleId] || null;
    };

    const renderModule = () => {
        const status = moduleStatus[activeTab];
        const data = getModuleData(activeTab);

        if (status === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Loader2 size={32} className="animate-spin text-sbos-electric mb-4" />
                    <p className="text-sm font-semibold text-sbos-navy">Analyzing...</p>
                    <p className="text-xs text-sbos-slate mt-1">
                        {activeTab === 'growth-plan'
                            ? 'Waiting for Diagnostic and Money Leaks to finish first...'
                            : 'This usually takes 5-15 seconds'
                        }
                    </p>
                </div>
            );
        }

        if (status === 'error' || !data) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle size={32} className="text-amber-500 mb-4" />
                    <p className="text-sm font-semibold text-sbos-navy">Analysis unavailable</p>
                    <p className="text-xs text-sbos-slate mt-1">This module couldn't be generated. Try again or use sample data.</p>
                </div>
            );
        }

        // Build branding object from theme for execution layers
        const branding = {
            primaryColor: theme.brandPrimary || '#2C3FB8',
            accentColor: theme.brandAccent || '#3366FF',
            companyName: theme.companyName || intakeData?.companyName || 'SBOS',
        };
        const recipientEmail = intakeData?.recipientEmail || '';

        switch (activeTab) {
            case 'diagnostic':
                return <DiagnosticModule data={data} recipientEmail={recipientEmail} branding={branding} />;
            case 'money-leaks':
                return <MoneyLeaksModule data={data} recipientEmail={recipientEmail} branding={branding} />;
            case 'growth-plan':
                return <GrowthPlanModule data={data} recipientEmail={recipientEmail} branding={branding} intakeData={intakeData} />;
            case 'sop-builder':
                return <SopBuilderModule data={data} recipientEmail={recipientEmail} branding={branding} />;
            case 'lead-auto':
                return <LeadAutomationModule data={data} recipientEmail={recipientEmail} branding={branding} />;
            default:
                return null;
        }
    };

    const activeModule = modules.find(m => m.id === activeTab);
    const completedCount = Object.values(moduleStatus).filter(s => s === 'done').length;
    const companyName = intakeData?.companyName || theme.companyName || 'Sample Business';
    const logoUrl = intakeData?.logoPreview || theme.logoUrl;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--demo-bg, #F8FAFF)' }}>
            {/* Demo Navbar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sbos-navy/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm font-semibold text-sbos-slate hover:text-sbos-navy transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">Back to SBOS</span>
                        </Link>
                        <div className="h-5 w-px bg-sbos-navy/10" />
                        <div className="flex items-center gap-2">
                            {logoUrl ? (
                                <img src={logoUrl} alt={companyName} className="h-7 w-auto object-contain" />
                            ) : (
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--brand-primary-10)' }}>
                                    <Building2 size={14} style={{ color: 'var(--brand-primary)' }} />
                                </div>
                            )}
                            <div>
                                <span className="text-sm font-bold text-sbos-navy">{companyName}</span>
                                <span className="hidden md:inline text-xs text-sbos-slate ml-2 font-mono">DEMO MODE</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden md:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border" style={{
                            color: usingSample ? '#059669' : 'var(--brand-primary)',
                            backgroundColor: usingSample ? '#ecfdf5' : 'var(--brand-primary-10)',
                            borderColor: usingSample ? '#a7f3d0' : 'var(--brand-primary-15)',
                        }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: usingSample ? '#10b981' : 'var(--brand-accent)' }} />
                            {usingSample ? 'Sample Data Active' : isAnalyzing ? `Analyzing (${completedCount}/5)` : 'Analysis Complete'}
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar — Tab Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="lg:sticky lg:top-24">
                            <div className="mb-4 px-1">
                                <p className="text-xs font-mono font-semibold text-sbos-slate uppercase tracking-widest">
                                    Analysis Modules
                                </p>
                            </div>

                            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                {modules.map((mod, idx) => {
                                    const Icon = mod.icon;
                                    const isActive = activeTab === mod.id;
                                    const status = moduleStatus[mod.id];
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => setActiveTab(mod.id)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 whitespace-nowrap flex-shrink-0
                                                ${isActive
                                                    ? 'bg-white shadow-lg shadow-sbos-navy/5'
                                                    : 'hover:bg-white/60 border border-transparent'
                                                }`}
                                            style={isActive ? { border: '1px solid var(--brand-accent-10)' } : undefined}
                                        >
                                            <div
                                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 relative"
                                                style={{ backgroundColor: `${mod.color}${isActive ? '22' : '10'}` }}
                                            >
                                                {status === 'loading' ? (
                                                    <Loader2 size={16} className="animate-spin" style={{ color: mod.color }} />
                                                ) : status === 'error' ? (
                                                    <AlertCircle size={16} className="text-amber-500" />
                                                ) : (
                                                    <Icon
                                                        size={18}
                                                        style={{ color: isActive ? mod.color : '#5E6B8A' }}
                                                        className="transition-colors duration-300"
                                                    />
                                                )}
                                                {status === 'done' && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-sbos-cloud" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-sm font-semibold block ${isActive ? 'text-sbos-navy' : 'text-sbos-slate'}`}>
                                                    {mod.name}
                                                </span>
                                                <span className="text-[10px] font-mono text-sbos-slate/60 uppercase tracking-wider hidden lg:block">
                                                    {status === 'loading' ? 'Analyzing...' : status === 'error' ? 'Failed' : `Module ${idx + 1} of 5`}
                                                </span>
                                            </div>
                                            {isActive && status === 'done' && (
                                                <ChevronRight size={14} style={{ color: 'var(--brand-accent)' }} className="hidden lg:block" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Bottom CTA */}
                            {usingSample && (
                                <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-sbos-navy/[0.03] border border-sbos-navy/5">
                                    <p className="text-xs text-sbos-slate leading-relaxed mb-3">
                                        Want these results with <strong>your</strong> business data?
                                    </p>
                                    <button
                                        onClick={() => navigate('/demo')}
                                        className="w-full text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                                        style={{ backgroundColor: 'var(--brand-primary)' }}
                                    >
                                        Run With Your Data
                                    </button>
                                </div>
                            )}
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {/* Module Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${activeModule.color}18` }}
                                >
                                    <activeModule.icon size={20} style={{ color: activeModule.color }} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-heading font-bold text-sbos-navy">
                                        {activeModule.name}
                                    </h1>
                                    <p className="text-xs font-mono text-sbos-slate/60 uppercase tracking-wider">
                                        {usingSample ? 'Generated from sample business data' : `Generated for ${companyName}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Module Content */}
                        <div ref={contentRef}>
                            {renderModule()}
                        </div>
                    </main>
                </div>
            </div>

            {/* AI Chat Widget */}
            <AIChatWidget
                intakeData={intakeData}
                analysisResults={moduleData}
                companyName={companyName}
            />

        </div>
    );
};

export default DemoResults;
