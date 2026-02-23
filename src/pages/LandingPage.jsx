import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhatIsSbos from '../components/WhatIsSbos';
import DemoModules from '../components/DemoModules';
import FitCheck from '../components/FitCheck';
import Comparison from '../components/Comparison';
import HowItWorks from '../components/HowItWorks';
import Security from '../components/Security';
import Faq from '../components/Faq';
import Footer from '../components/Footer';

const LandingPage = () => {
    return (
        <>
            <div className="noise-overlay" />
            <Navbar />
            <main className="min-h-screen bg-sbos-cloud text-sbos-ink relative bg-blueprint-grid overflow-x-hidden">
                <Hero />
                <WhatIsSbos />
                <DemoModules />
                <FitCheck />
                <Comparison />
                <HowItWorks />
                <Security />
                <Faq />
            </main>
            <Footer />
        </>
    );
};

export default LandingPage;
