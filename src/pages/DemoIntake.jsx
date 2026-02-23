import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
    ArrowLeft, ArrowRight, Building2, Users, DollarSign,
    Target, AlertCircle, Upload, FileText, Clipboard,
    Mail, MessageSquare, Phone, Sparkles, CheckCircle2,
    ChevronDown, X, Plus, Zap, Palette, Image, Pipette, RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ─────────── option data ─────────── */
const revenueOptions = [
    'Under $100K', '$100K – $250K', '$250K – $500K',
    '$500K – $1M', '$1M – $5M', '$5M+',
];

const goalOptions = [
    'Reduce wasted spend', 'Streamline operations', 'Increase revenue',
    'Document processes', 'Automate follow-up', 'Improve team alignment',
    'Better client onboarding', 'Scale without more hires',
];

const bottleneckOptions = [
    'Too many disconnected tools', 'Manual follow-up is failing',
    'No documented processes', 'Revenue tracking is messy',
    'Team communication gaps', 'Client onboarding is inconsistent',
    'Can\'t prioritize what to fix first',
];

const leadSourceOptions = [
    'Website forms', 'Referrals', 'Social media',
    'Cold outreach', 'Networking events', 'Paid ads', 'Partnerships',
];

const toneOptions = [
    { value: 'professional', label: 'Professional', desc: 'Formal, polished, corporate-appropriate' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm, approachable, conversational' },
    { value: 'casual', label: 'Casual', desc: 'Relaxed, direct, down-to-earth' },
];

/* ─────────── color presets ─────────── */
const colorPresets = [
    { label: 'SBOS Blue', primary: '#2C3FB8', accent: '#3366FF' },
    { label: 'Sunset Orange', primary: '#E65100', accent: '#FF8A00' },
    { label: 'Forest Green', primary: '#1B7340', accent: '#22C55E' },
    { label: 'Bold Red', primary: '#C41E3A', accent: '#EF4444' },
    { label: 'Royal Purple', primary: '#6D28D9', accent: '#8B5CF6' },
    { label: 'Ocean Teal', primary: '#0D7377', accent: '#14B8A6' },
    { label: 'Charcoal', primary: '#1F2937', accent: '#6B7280' },
    { label: 'Hot Pink', primary: '#BE185D', accent: '#EC4899' },
];

const bgPresets = [
    { label: 'Cloud White', value: '#F8FAFF', preview: '#F8FAFF' },
    { label: 'Warm Cream', value: '#FFFBF5', preview: '#FFFBF5' },
    { label: 'Cool Gray', value: '#F3F4F6', preview: '#F3F4F6' },
    { label: 'Pure White', value: '#FFFFFF', preview: '#FFFFFF' },
    { label: 'Soft Mint', value: '#F0FDF4', preview: '#F0FDF4' },
    { label: 'Soft Lavender', value: '#FAF5FF', preview: '#FAF5FF' },
];

/* ─────────── sample data for skip ─────────── */
const sampleData = {
    companyName: 'Acme Local Services',
    teamSize: 12,
    revenueRange: '$500K – $1M',
    goals: ['Reduce wasted spend', 'Streamline operations', 'Automate follow-up'],
    bottleneck: 'Too many disconnected tools',
    financialData: `QuickBooks - $30/mo
Slack - $12/user × 12 = $144/mo
Monday.com - $10/user × 8 = $80/mo
Asana - $11/user × 8 = $88/mo
FreshBooks - $25/mo
Google Workspace - $12/user × 12 = $144/mo
Mailchimp - $20/mo
ConvertKit - $79/mo
Calendly Teams - $48/mo
Microsoft 365 - $15/user × 12 = $180/mo
HubSpot CRM - $150/mo
Zoom Pro - $15/mo`,
    toolList: `Slack, $144/mo, Communication, Daily
Monday.com, $80/mo, Project Management, Daily
Asana, $88/mo, Project Management, Weekly
QuickBooks, $30/mo, Accounting, Daily
FreshBooks, $25/mo, Invoicing, Weekly
Google Workspace, $144/mo, Cloud / Storage, Daily
Microsoft 365, $180/mo, Cloud / Storage, Daily
Mailchimp, $20/mo, Marketing, Rarely
ConvertKit, $79/mo, Marketing, Rarely
Calendly, $48/mo, Scheduling, Weekly
HubSpot, $150/mo, CRM, Daily
Zoom, $15/mo, Communication, Daily`,
    processes: [
        'New Client Onboarding: When we close a deal, the sales person sends a welcome email, then ops creates a project board. Account manager schedules a kickoff call. Finance sets up invoicing. Takes about 2 days total but steps get missed sometimes.',
        'Lead Intake: Leads come in through the website form and referrals. Sales person logs them in HubSpot, sends acknowledgment email, then tries to qualify them on a call. Follow-up is manual and inconsistent.',
        'Monthly Invoice Review: Finance exports outstanding invoices from QuickBooks at month end, cross-references with project completion in Monday.com, sends payment reminders for overdue ones, then updates the cash flow forecast.',
    ],
    followUp: 'Mostly manual — the sales team tries to remember who to follow up with. Sometimes we use reminder tasks in Monday.com but it\'s inconsistent. Important leads definitely slip through the cracks.',
    leadSources: ['Website forms', 'Referrals', 'Social media'],
    channels: ['email', 'sms'],
    tone: 'friendly',
};

/* ─────────── component ─────────── */
const DemoIntake = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const stepRef = useRef(null);

    // Screen 0: Branding state
    const [companyName, setCompanyName] = useState(theme.companyName || '');
    const [brandPrimary, setBrandPrimary] = useState(theme.brandPrimary || '#2C3FB8');
    const [brandAccent, setBrandAccent] = useState(theme.brandAccent || '#3366FF');
    const [bgColor, setBgColor] = useState(theme.bgTint || '#F8FAFF');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(theme.logoUrl || null);

    // Screen 1: Company basics (company name moved to Screen 0)
    const [teamSize, setTeamSize] = useState('');
    const [revenueRange, setRevenueRange] = useState('');
    const [goals, setGoals] = useState([]);
    const [bottleneck, setBottleneck] = useState('');

    // Screen 2: Financials
    const [financialData, setFinancialData] = useState('');
    const [toolList, setToolList] = useState('');
    const [csvFile, setCsvFile] = useState(null);

    // Screen 3: Processes
    const [processes, setProcesses] = useState(['']);
    const [followUp, setFollowUp] = useState('');
    const [leadSources, setLeadSources] = useState([]);
    const [channels, setChannels] = useState([]);
    const [tone, setTone] = useState('');

    const totalSteps = 4;

    // Animate step transitions
    useEffect(() => {
        if (!stepRef.current) return;
        gsap.fromTo(stepRef.current,
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' }
        );
    }, [currentStep]);

    // Logo file handling
    const handleLogoUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
    }, []);

    const handleLogoDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target.result);
        reader.readAsDataURL(file);
    }, []);

    const clearLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const toggleChip = (value, selected, setter) => {
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
    };

    const applyPreset = (preset) => {
        setBrandPrimary(preset.primary);
        setBrandAccent(preset.accent);
    };

    const resetBranding = () => {
        setBrandPrimary('#2C3FB8');
        setBrandAccent('#3366FF');
        setBgColor('#F8FAFF');
        clearLogo();
    };

    const handleSkipToSample = () => {
        navigate('/demo/results');
    };

    const handleNext = () => {
        if (currentStep === 0) {
            // Apply branding when leaving Screen 0
            theme.setDemoTheme({
                brandPrimary,
                brandAccent,
                companyName,
                logoUrl: logoPreview,
                bgTint: bgColor,
            });
        }
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = () => {
        const intakeData = {
            companyName,
            teamSize: parseInt(teamSize) || 0,
            revenueRange,
            goals,
            bottleneck,
            financialData,
            toolList,
            processes: processes.filter(Boolean),
            followUp,
            leadSources,
            channels,
            tone,
            logoPreview,
        };
        navigate('/demo/results', { state: { intakeData } });
    };

    const addProcess = () => {
        if (processes.length < 5) {
            setProcesses([...processes, '']);
        }
    };

    const updateProcess = (idx, value) => {
        const updated = [...processes];
        updated[idx] = value;
        setProcesses(updated);
    };

    const removeProcess = (idx) => {
        if (processes.length > 1) {
            setProcesses(processes.filter((_, i) => i !== idx));
        }
    };

    const canProceed = () => {
        if (currentStep === 0) {
            return companyName.trim(); // Only company name required
        }
        if (currentStep === 1) {
            return teamSize && revenueRange && goals.length > 0 && bottleneck;
        }
        return true;
    };

    const stepLabels = ['Brand', 'Company', 'Financials', 'Processes'];

    const isValidHex = (str) => /^#[0-9A-Fa-f]{6}$/.test(str);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--demo-bg, #F8FAFF)' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-sbos-navy/5">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-sbos-slate hover:text-sbos-navy transition-colors">
                        <ArrowLeft size={16} />
                        <span className="hidden sm:inline">Back to SBOS</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        {logoPreview ? (
                            <img src={logoPreview} alt={companyName || 'Logo'} className="h-7 w-auto object-contain" />
                        ) : (
                            <Sparkles size={16} style={{ color: 'var(--brand-accent)' }} />
                        )}
                        <span className="text-sm font-bold text-sbos-navy">
                            {companyName ? `${companyName} Demo` : 'SBOS Demo Setup'}
                        </span>
                    </div>
                    <button
                        onClick={handleSkipToSample}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: 'var(--brand-accent)' }}
                    >
                        Skip — use sample data →
                    </button>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        {stepLabels.map((label, idx) => (
                            <button
                                key={idx}
                                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${idx === currentStep ? 'text-sbos-navy' :
                                    idx < currentStep ? 'cursor-pointer' :
                                        'text-sbos-slate/40'
                                    }`}
                                style={idx < currentStep ? { color: 'var(--brand-accent)' } : undefined}
                            >
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${idx > currentStep ? 'bg-white text-sbos-slate/40 border-sbos-navy/10' : 'text-white'}`}
                                    style={idx <= currentStep ? { backgroundColor: idx === currentStep ? 'var(--brand-primary)' : 'var(--brand-accent)', borderColor: idx === currentStep ? 'var(--brand-primary)' : 'var(--brand-accent)' } : undefined}
                                >
                                    {idx < currentStep ? <CheckCircle2 size={14} /> : idx + 1}
                                </div>
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="h-1.5 bg-sbos-navy/[0.04] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ background: `linear-gradient(to right, var(--brand-primary), var(--brand-accent))`, width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div ref={stepRef}>

                    {/* ═══════════ SCREEN 0: BRAND YOUR DEMO ═══════════ */}
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-sbos-navy mb-1">Brand your demo</h2>
                                <p className="text-sm text-sbos-slate">Customize the look and feel to match your business. Everything here is optional except company name.</p>
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Company name <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40" />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Riverside Plumbing Co"
                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Logo <span className="font-normal text-sbos-slate ml-1">(optional)</span>
                                </label>
                                {logoPreview ? (
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-sbos-navy/10">
                                        <img src={logoPreview} alt="Logo preview" className="h-12 w-auto object-contain max-w-[200px]" />
                                        <div className="flex-1">
                                            <p className="text-xs text-sbos-slate">{logoFile?.name || 'Logo loaded'}</p>
                                        </div>
                                        <button onClick={clearLogo} className="text-sbos-slate/40 hover:text-red-400 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={handleLogoDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="relative flex flex-col items-center justify-center p-8 bg-white rounded-xl border-2 border-dashed border-sbos-navy/10 hover:border-sbos-electric/30 transition-colors cursor-pointer"
                                    >
                                        <Image size={24} className="text-sbos-slate/30 mb-2" />
                                        <p className="text-sm text-sbos-slate font-semibold">Drop your logo here</p>
                                        <p className="text-xs text-sbos-slate/60 mt-0.5">or click to browse • PNG, JPG, SVG</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Color Presets */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-sm font-semibold text-sbos-navy">
                                        Brand colors <span className="font-normal text-sbos-slate ml-1">(pick a preset or choose custom)</span>
                                    </label>
                                    <button
                                        onClick={resetBranding}
                                        className="flex items-center gap-1 text-xs text-sbos-slate hover:text-sbos-navy transition-colors"
                                    >
                                        <RotateCcw size={12} /> Reset
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
                                    {colorPresets.map((preset) => {
                                        const isActive = brandPrimary === preset.primary && brandAccent === preset.accent;
                                        return (
                                            <button
                                                key={preset.label}
                                                onClick={() => applyPreset(preset)}
                                                className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 ${isActive ? 'border-sbos-navy/20 bg-sbos-navy/[0.03] shadow-sm' : 'border-transparent hover:bg-white'}`}
                                                title={preset.label}
                                            >
                                                <div className="flex gap-0.5">
                                                    <div className="w-5 h-5 rounded-full border border-black/5" style={{ backgroundColor: preset.primary }} />
                                                    <div className="w-5 h-5 rounded-full border border-black/5" style={{ backgroundColor: preset.accent }} />
                                                </div>
                                                <span className="text-[9px] font-semibold text-sbos-slate/70 leading-tight text-center">{preset.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Color Pickers */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Primary */}
                                    <div className="p-4 bg-white rounded-xl border border-sbos-navy/10">
                                        <label className="block text-xs font-semibold text-sbos-navy mb-2">Primary color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={brandPrimary}
                                                    onChange={(e) => setBrandPrimary(e.target.value)}
                                                    className="w-10 h-10 rounded-lg border border-sbos-navy/10 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={brandPrimary}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (v.length <= 7) {
                                                        const corrected = v.startsWith('#') ? v : `#${v}`;
                                                        setBrandPrimary(corrected);
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 bg-sbos-navy/[0.02] rounded-lg text-xs font-mono text-sbos-navy border border-sbos-navy/5 focus:outline-none focus:border-sbos-electric/30"
                                                placeholder="#2C3FB8"
                                            />
                                        </div>
                                        <p className="text-[10px] text-sbos-slate/60 mt-2">Buttons, progress bars, step indicators</p>
                                    </div>

                                    {/* Accent */}
                                    <div className="p-4 bg-white rounded-xl border border-sbos-navy/10">
                                        <label className="block text-xs font-semibold text-sbos-navy mb-2">Accent color</label>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={brandAccent}
                                                    onChange={(e) => setBrandAccent(e.target.value)}
                                                    className="w-10 h-10 rounded-lg border border-sbos-navy/10 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={brandAccent}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    if (v.length <= 7) {
                                                        const corrected = v.startsWith('#') ? v : `#${v}`;
                                                        setBrandAccent(corrected);
                                                    }
                                                }}
                                                className="flex-1 px-3 py-2 bg-sbos-navy/[0.02] rounded-lg text-xs font-mono text-sbos-navy border border-sbos-navy/5 focus:outline-none focus:border-sbos-electric/30"
                                                placeholder="#3366FF"
                                            />
                                        </div>
                                        <p className="text-[10px] text-sbos-slate/60 mt-2">Selected chips, highlights, links</p>
                                    </div>
                                </div>
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Background color <span className="font-normal text-sbos-slate ml-1">(optional)</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {bgPresets.map((preset) => {
                                        const isActive = bgColor === preset.value;
                                        return (
                                            <button
                                                key={preset.value}
                                                onClick={() => setBgColor(preset.value)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${isActive ? 'border-sbos-navy/20 shadow-sm' : 'border-sbos-navy/5 hover:border-sbos-navy/10'}`}
                                            >
                                                <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: preset.preview }} />
                                                {preset.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sbos-navy/10">
                                    <Pipette size={14} className="text-sbos-slate/40" />
                                    <span className="text-xs text-sbos-slate">Custom:</span>
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg border border-sbos-navy/10 cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                                    />
                                    <input
                                        type="text"
                                        value={bgColor}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (v.length <= 7) {
                                                const corrected = v.startsWith('#') ? v : `#${v}`;
                                                setBgColor(corrected);
                                            }
                                        }}
                                        className="w-24 px-2 py-1.5 bg-sbos-navy/[0.02] rounded-lg text-xs font-mono text-sbos-navy border border-sbos-navy/5 focus:outline-none"
                                        placeholder="#F8FAFF"
                                    />
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">Live preview</label>
                                <div className="p-6 rounded-2xl border border-sbos-navy/10 space-y-4" style={{ backgroundColor: bgColor }}>
                                    {/* Mini header */}
                                    <div className="flex items-center gap-2">
                                        {logoPreview && <img src={logoPreview} alt="" className="h-5 w-auto" />}
                                        <span className="text-sm font-bold" style={{ color: brandPrimary }}>{companyName || 'Your Company'}</span>
                                        <span className="text-[10px] font-mono text-sbos-slate/50 ml-auto">DEMO MODE</span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${brandPrimary}15` }}>
                                        <div className="h-full w-2/3 rounded-full" style={{ background: `linear-gradient(to right, ${brandPrimary}, ${brandAccent})` }} />
                                    </div>
                                    {/* Mini buttons */}
                                    <div className="flex items-center gap-2">
                                        <div className="px-4 py-2 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: brandPrimary }}>
                                            Primary Button
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ backgroundColor: `${brandAccent}15`, borderColor: `${brandAccent}30`, color: brandAccent }}>
                                            ✓ Selected Chip
                                        </div>
                                        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-sbos-navy/10 text-sbos-navy">
                                            Unselected
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ SCREEN 1: COMPANY BASICS ═══════════ */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-sbos-navy mb-1">Tell us about your business</h2>
                                <p className="text-sm text-sbos-slate">This helps SBOS tailor the analysis to your situation.</p>
                            </div>

                            {/* Team Size */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Team size <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40" />
                                    <input
                                        type="number"
                                        value={teamSize}
                                        onChange={(e) => setTeamSize(e.target.value)}
                                        placeholder="e.g. 12"
                                        min="1"
                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Revenue Range */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Revenue range <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40" />
                                    <select
                                        value={revenueRange}
                                        onChange={(e) => setRevenueRange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy appearance-none focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all"
                                    >
                                        <option value="">Select a range</option>
                                        {revenueOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40 pointer-events-none" />
                                </div>
                            </div>

                            {/* Goals */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Top goals <span className="text-red-400">*</span>
                                    <span className="font-normal text-sbos-slate ml-1">(select up to 3)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {goalOptions.map(goal => {
                                        const isSelected = goals.includes(goal);
                                        const isDisabled = !isSelected && goals.length >= 3;
                                        return (
                                            <button
                                                key={goal}
                                                onClick={() => !isDisabled && toggleChip(goal, goals, setGoals)}
                                                disabled={isDisabled}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${isSelected
                                                    ? 'border-transparent'
                                                    : isDisabled
                                                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                                        : 'bg-white border-sbos-navy/10 text-sbos-navy'
                                                    }`}
                                                style={isSelected ? { backgroundColor: 'var(--brand-accent-10)', borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' } : undefined}
                                            >
                                                {isSelected && <CheckCircle2 size={12} className="inline mr-1 -mt-0.5" />}
                                                {goal}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottleneck */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Biggest bottleneck <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <AlertCircle size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40" />
                                    <select
                                        value={bottleneck}
                                        onChange={(e) => setBottleneck(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy appearance-none focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all"
                                    >
                                        <option value="">Select your biggest challenge</option>
                                        {bottleneckOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sbos-slate/40 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ SCREEN 2: FINANCIALS ═══════════ */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-sbos-navy mb-1">Financials & tools</h2>
                                <p className="text-sm text-sbos-slate">Paste your expenses and tools so SBOS can find savings. All fields are optional.</p>
                            </div>

                            {/* Financial Data */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Monthly expenses / payments
                                    <span className="font-normal text-sbos-slate ml-1">(paste or upload CSV)</span>
                                </label>
                                <textarea
                                    value={financialData}
                                    onChange={(e) => setFinancialData(e.target.value)}
                                    placeholder={`Paste your expenses, one per line. Example:\nQuickBooks - $30/mo\nSlack - $12/user × 12 = $144/mo\nOffice rent - $2,400/mo`}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy font-mono placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all resize-none"
                                />
                                <div className="mt-2 flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-sbos-navy/10 text-xs font-semibold text-sbos-navy cursor-pointer hover:border-sbos-electric/30 transition-colors">
                                        <Upload size={14} />
                                        Upload CSV
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => setCsvFile(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                    {csvFile && (
                                        <span className="text-xs text-sbos-slate flex items-center gap-1">
                                            <FileText size={12} />
                                            {csvFile.name}
                                            <button onClick={() => setCsvFile(null)}><X size={12} className="text-red-400 ml-1" /></button>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tool List */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Software & subscriptions
                                    <span className="font-normal text-sbos-slate ml-1">(tool name, cost per line)</span>
                                </label>
                                <textarea
                                    value={toolList}
                                    onChange={(e) => setToolList(e.target.value)}
                                    placeholder={`Paste your tools, one per line. Example:\nSlack, $144/mo, Communication, Daily\nMonday.com, $80/mo, Project Management, Daily\nMailchimp, $20/mo, Marketing, Rarely`}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy font-mono placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all resize-none"
                                />
                            </div>

                            {/* Help tip */}
                            <div className="flex items-start gap-3 p-4 bg-sbos-electric/[0.04] rounded-xl border border-sbos-electric/10">
                                <Zap size={16} className="text-sbos-electric flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-sbos-slate leading-relaxed">
                                    <strong className="text-sbos-navy">Don't have this handy?</strong> No problem — you can skip this step. SBOS will still analyze your business based on the info you've already provided.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ═══════════ SCREEN 3: PROCESSES & SALES ═══════════ */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-sbos-navy mb-1">Processes & sales</h2>
                                <p className="text-sm text-sbos-slate">Describe how your key processes work today. SBOS will generate SOPs and automation flows from this.</p>
                            </div>

                            {/* Key Processes */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Key processes
                                    <span className="font-normal text-sbos-slate ml-1">(describe up to 5)</span>
                                </label>
                                <div className="space-y-3">
                                    {processes.map((proc, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute left-3.5 top-3 w-5 h-5 rounded-md bg-sbos-royal/10 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-sbos-royal">{idx + 1}</span>
                                            </div>
                                            <textarea
                                                value={proc}
                                                onChange={(e) => updateProcess(idx, e.target.value)}
                                                placeholder={idx === 0
                                                    ? 'e.g. New Client Onboarding: Sales sends welcome email, ops creates project board, account manager schedules kickoff...'
                                                    : 'Describe another process...'
                                                }
                                                rows={3}
                                                className="w-full pl-12 pr-10 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all resize-none"
                                            />
                                            {processes.length > 1 && (
                                                <button
                                                    onClick={() => removeProcess(idx)}
                                                    className="absolute right-3 top-3 text-sbos-slate/30 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {processes.length < 5 && (
                                        <button
                                            onClick={addProcess}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors"
                                            style={{ color: 'var(--brand-accent)' }}
                                        >
                                            <Plus size={14} />
                                            Add another process
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Follow-up */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    How does follow-up work today?
                                </label>
                                <textarea
                                    value={followUp}
                                    onChange={(e) => setFollowUp(e.target.value)}
                                    placeholder="e.g. Mostly manual — sales team tries to remember who to follow up with. Sometimes we use task reminders but leads slip through the cracks."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white rounded-xl border border-sbos-navy/10 text-sm text-sbos-navy placeholder:text-sbos-slate/40 focus:outline-none focus:border-sbos-electric focus:ring-2 focus:ring-sbos-electric/10 transition-all resize-none"
                                />
                            </div>

                            {/* Lead Sources */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Where do leads come from?
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {leadSourceOptions.map(src => {
                                        const isSelected = leadSources.includes(src);
                                        return (
                                            <button
                                                key={src}
                                                onClick={() => toggleChip(src, leadSources, setLeadSources)}
                                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${isSelected
                                                    ? 'border-transparent'
                                                    : 'bg-white border-sbos-navy/10 text-sbos-navy'
                                                    }`}
                                                style={isSelected ? { backgroundColor: 'var(--brand-accent-10)', borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' } : undefined}
                                            >
                                                {isSelected && <CheckCircle2 size={12} className="inline mr-1 -mt-0.5" />}
                                                {src}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Channels */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Preferred communication channels
                                </label>
                                <div className="flex gap-3">
                                    {[
                                        { id: 'email', label: 'Email', icon: Mail },
                                        { id: 'sms', label: 'SMS', icon: MessageSquare },
                                        { id: 'phone', label: 'Phone', icon: Phone },
                                    ].map(ch => {
                                        const isSelected = channels.includes(ch.id);
                                        const Icon = ch.icon;
                                        return (
                                            <button
                                                key={ch.id}
                                                onClick={() => toggleChip(ch.id, channels, setChannels)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${isSelected
                                                    ? 'border-transparent'
                                                    : 'bg-white border-sbos-navy/10 text-sbos-navy'
                                                    }`}
                                                style={isSelected ? { backgroundColor: 'var(--brand-accent-10)', borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' } : undefined}
                                            >
                                                <Icon size={14} />
                                                {ch.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tone */}
                            <div>
                                <label className="block text-sm font-semibold text-sbos-navy mb-1.5">
                                    Communication tone
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {toneOptions.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTone(t.value)}
                                            className={`p-3 rounded-xl text-left border transition-all duration-200 ${tone === t.value
                                                ? 'border-transparent'
                                                : 'bg-white border-sbos-navy/10'
                                                }`}
                                            style={tone === t.value ? { backgroundColor: 'var(--brand-accent-10)', borderColor: 'var(--brand-accent)' } : undefined}
                                        >
                                            <p className="text-sm font-semibold" style={tone === t.value ? { color: 'var(--brand-accent)' } : { color: '#101426' }}>{t.label}</p>
                                            <p className="text-xs text-sbos-slate mt-0.5">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="mt-10 flex items-center justify-between">
                    <div>
                        {currentStep > 0 ? (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-sbos-slate hover:text-sbos-navy transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSkipToSample}
                            className="px-4 py-2.5 text-xs font-semibold text-sbos-slate hover:text-sbos-electric transition-colors"
                        >
                            Use sample data instead
                        </button>

                        {currentStep < totalSteps - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${canProceed()
                                    ? 'text-white hover:scale-[1.02] shadow-lg'
                                    : 'bg-sbos-navy/10 text-sbos-slate/40 cursor-not-allowed'
                                    }`}
                                style={canProceed() ? { backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 25px -5px var(--brand-primary-20)' } : undefined}
                            >
                                Continue
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold hover:scale-[1.02] shadow-lg transition-all duration-300"
                                style={{ backgroundColor: 'var(--brand-primary)', boxShadow: '0 10px 25px -5px var(--brand-primary-20)' }}
                            >
                                <Sparkles size={16} />
                                Generate Analysis
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoIntake;
