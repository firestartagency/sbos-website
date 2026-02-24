import React, { useState } from 'react';
import { PlayCircle, Target } from 'lucide-react';
import CalendlyModal from './CalendlyModal';

const Footer = () => {
    const [bookingOpen, setBookingOpen] = useState(false);
    return (
        <footer className="bg-[#0A0D1C] text-white pt-24 pb-8 relative overflow-hidden rounded-t-[2.5rem] mt-[-2rem] z-20">

            {/* Background Graphic */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sbos-electric/10 to-transparent pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* CTA Endcap */}
                <div className="bg-sbos-navy/50 border border-sbos-royal/30 rounded-3xl p-10 md:p-16 mb-20 text-center backdrop-blur-md relative overflow-hidden">
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-sbos-electric/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Start Small. <span className="text-sbos-electric font-accent italic">See Value Fast.</span></h2>
                        <p className="text-xl text-sbos-ice/80 mb-10 text-balance">
                            You don't need a massive digital transformation. You need clarity today. Launch the interactive demo to see how simple operations can be.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
                            <button className="w-full sm:w-auto bg-sbos-royal hover:bg-sbos-electric text-white px-10 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-sbos-electric/25">
                                Open Demo
                            </button>
                            <button onClick={() => setBookingOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 group bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300">
                                <PlayCircle size={20} className="text-sbos-ice group-hover:text-white transition-colors" />
                                Book Walkthrough
                            </button>
                        </div>

                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-xs font-mono text-sbos-slate/80">
                                <Target size={14} /> 10-Minute Process
                            </div>
                            <div className="flex items-center gap-2 text-xs font-mono text-sbos-slate/80">
                                <Target size={14} /> No Login Required
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="md:col-span-5 flex flex-col items-start">
                        <img src="https://res.cloudinary.com/dbtuwhauh/image/upload/v1771843214/SBOS_Logo_For_Website_oi6aqp.png" alt="SBOS" className="h-8 w-auto mb-6 brightness-0 invert opacity-90" />
                        <p className="text-sbos-slate text-sm max-w-xs leading-relaxed">
                            The modern operating system for small business. From scattered chaos to clear execution.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider">Product</h4>
                            <ul className="space-y-3">
                                <li><a href="#demo" className="text-sbos-slate hover:text-white text-sm transition-colors">Demo Modules</a></li>
                                <li><a href="#how-it-works" className="text-sbos-slate hover:text-white text-sm transition-colors">How It Works</a></li>
                                <li><a href="#security" className="text-sbos-slate hover:text-white text-sm transition-colors">Security</a></li>
                                <li><a href="#faq" className="text-sbos-slate hover:text-white text-sm transition-colors">FAQ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-semibold mb-4 text-sm tracking-wider">Company</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sbos-slate hover:text-white text-sm transition-colors">About Us</a></li>
                                <li><a href="#" className="text-sbos-slate hover:text-white text-sm transition-colors">Contact</a></li>
                                <li><button onClick={() => setBookingOpen(true)} className="text-sbos-slate hover:text-white text-sm transition-colors text-left">Book a Walkthrough</button></li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1 border-t border-white/10 pt-6 sm:border-0 sm:pt-0">
                            <span className="text-xs text-sbos-slate block mb-4 italic">
                                * Note: The current environment is a demonstration instance. No live writes will occur.
                            </span>
                        </div>
                    </div>
                </div>

                {/* System Status Line */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sbos-slate text-xs">© {new Date().getFullYear()} SBOS. All rights reserved.</p>

                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sbos-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-sbos-success"></span>
                        </span>
                        <span className="font-mono text-[10px] text-sbos-slate uppercase tracking-widest">System Operational</span>
                    </div>
                </div>

            </div>
            <CalendlyModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
        </footer>
    );
};

export default Footer;
