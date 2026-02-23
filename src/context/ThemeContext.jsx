import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Demo branding theme system.
 * 
 * Scoped ONLY to /demo and /demo/results pages.
 * Landing page (/) ignores this entirely.
 *
 * Two ways to set theme:
 * 1. URL params:  /demo?brand=FF5500&accent=FF8800&name=ClientName&logo=...&bg=FFF5F0
 * 2. Programmatic: setDemoTheme({ brandPrimary: '#FF5500', ... }) from Screen 0
 */

const STORAGE_KEY = 'sbos-demo-theme';

const SBOS_DEFAULTS = {
    brandPrimary: '#2C3FB8',
    brandAccent: '#3366FF',
    brandPrimaryDark: '#1E2478',
    companyName: '',
    logoUrl: null,
    bgTint: '#F8FAFF',
    isCustomBranded: false,
};

const ThemeContext = createContext({ ...SBOS_DEFAULTS, setDemoTheme: () => { } });

/* ─── Color helpers ─── */

function hexToHSL(hex) {
    const clean = hex.replace('#', '');
    let r = parseInt(clean.slice(0, 2), 16) / 255;
    let g = parseInt(clean.slice(2, 4), 16) / 255;
    let b = parseInt(clean.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function isValidHex(str) {
    return /^#?[0-9A-Fa-f]{6}$/.test(str);
}

function normalizeHex(str) {
    const clean = str.replace('#', '');
    return isValidHex(clean) ? `#${clean}` : null;
}

function applyThemeToCSS(themeObj) {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', themeObj.brandPrimary);
    root.style.setProperty('--brand-accent', themeObj.brandAccent);
    root.style.setProperty('--brand-primary-dark', themeObj.brandPrimaryDark);

    const primaryHSL = hexToHSL(themeObj.brandPrimary);
    root.style.setProperty('--brand-primary-light', `hsl(${primaryHSL.h}, ${primaryHSL.s}%, 95%)`);
    root.style.setProperty('--brand-primary-ultralight', `hsl(${primaryHSL.h}, ${primaryHSL.s}%, 97%)`);
    root.style.setProperty('--brand-primary-10', `hsla(${primaryHSL.h}, ${primaryHSL.s}%, ${primaryHSL.l}%, 0.10)`);
    root.style.setProperty('--brand-primary-15', `hsla(${primaryHSL.h}, ${primaryHSL.s}%, ${primaryHSL.l}%, 0.15)`);
    root.style.setProperty('--brand-primary-20', `hsla(${primaryHSL.h}, ${primaryHSL.s}%, ${primaryHSL.l}%, 0.20)`);

    const accentHSL = hexToHSL(themeObj.brandAccent);
    root.style.setProperty('--brand-accent-light', `hsl(${accentHSL.h}, ${accentHSL.s}%, 95%)`);
    root.style.setProperty('--brand-accent-10', `hsla(${accentHSL.h}, ${accentHSL.s}%, ${accentHSL.l}%, 0.10)`);

    root.style.setProperty('--demo-bg', themeObj.bgTint || '#F8FAFF');
}

/* ─── Provider ─── */

export const ThemeProvider = ({ children }) => {
    const [searchParams] = useSearchParams();
    const [theme, setTheme] = useState(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return SBOS_DEFAULTS;
    });

    // Programmatic setter — called from Screen 0
    const setDemoTheme = useCallback((overrides) => {
        const newTheme = {
            ...SBOS_DEFAULTS,
            ...overrides,
            isCustomBranded: true,
        };

        // Compute dark variant
        const primaryHSL = hexToHSL(newTheme.brandPrimary);
        newTheme.brandPrimaryDark = `hsl(${primaryHSL.h}, ${primaryHSL.s}%, ${Math.max(primaryHSL.l - 15, 10)}%)`;

        setTheme(newTheme);
        applyThemeToCSS(newTheme);
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newTheme)); } catch { /* ignore */ }
    }, []);

    // URL params — one-time read on mount
    useEffect(() => {
        const brand = searchParams.get('brand');
        const accent = searchParams.get('accent');
        const name = searchParams.get('name');
        const logo = searchParams.get('logo');
        const bg = searchParams.get('bg');

        const hasParams = brand || accent || name || logo || bg;

        let resolvedTheme;
        if (hasParams) {
            resolvedTheme = {
                brandPrimary: normalizeHex(brand || '') || SBOS_DEFAULTS.brandPrimary,
                brandAccent: normalizeHex(accent || '') || SBOS_DEFAULTS.brandAccent,
                brandPrimaryDark: SBOS_DEFAULTS.brandPrimaryDark,
                companyName: name ? decodeURIComponent(name) : '',
                logoUrl: logo ? decodeURIComponent(logo) : null,
                bgTint: normalizeHex(bg || '') || '#F8FAFF',
                isCustomBranded: true,
            };

            const primaryHSL = hexToHSL(resolvedTheme.brandPrimary);
            resolvedTheme.brandPrimaryDark = `hsl(${primaryHSL.h}, ${primaryHSL.s}%, ${Math.max(primaryHSL.l - 15, 10)}%)`;
            try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedTheme)); } catch { /* ignore */ }
        } else {
            try {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                resolvedTheme = stored ? JSON.parse(stored) : SBOS_DEFAULTS;
            } catch { resolvedTheme = SBOS_DEFAULTS; }
        }

        setTheme(resolvedTheme);
        applyThemeToCSS(resolvedTheme);
    }, [searchParams]);

    return (
        <ThemeContext.Provider value={{ ...theme, setDemoTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export const clearDemoTheme = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    const root = document.documentElement;
    ['--brand-primary', '--brand-accent', '--brand-primary-dark', '--brand-primary-light',
        '--brand-primary-ultralight', '--brand-primary-10', '--brand-primary-15', '--brand-primary-20',
        '--brand-accent-light', '--brand-accent-10', '--demo-bg'].forEach(v => root.style.removeProperty(v));
};

export default ThemeContext;
