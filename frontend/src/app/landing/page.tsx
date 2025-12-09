'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense, useRef } from 'react';

// Dynamically import 3D components
const SceneContainer = dynamic(() => import('@/components/Three/SceneContainer'), { ssr: false });
const SentinelGlobe = dynamic(() => import('@/components/Three/SentinelGlobe'), { ssr: false });
const AuroraBackground = dynamic(() => import('@/components/Three/AuroraBackground'), { ssr: false });

export default function LandingPage() {
    const scrollRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: scrollRef });

    // Parallax effects
    const yHero = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={scrollRef} className="min-h-screen bg-[#0f172a] text-white overflow-hidden font-sans selection:bg-cyan-500/30">

            {/* 🌌 WEBGL AURORA BACKGROUND */}
            <div className="fixed inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-[#0f172a]" />}>
                    <SceneContainer className="w-full h-full">
                        <AuroraBackground />
                    </SceneContainer>
                </Suspense>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-[#0f172a]/20">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-2xl group-hover:animate-spin transition-transform duration-700">🔮</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:tracking-wider transition-all duration-300">
                            VN30-QUANTUM
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        {['Features', 'Pricing', 'Docs'].map((item) => (
                            <Link key={item} href={`#${item.toLowerCase()}`} className="relative group overflow-hidden">
                                <span className="relative z-10 group-hover:text-cyan-400 transition">{item}</span>
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition duration-300" />
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium hover:text-white transition text-gray-300">
                            LOG IN
                        </Link>
                        <Link
                            href="/beta"
                            className="relative px-6 py-2.5 rounded-lg font-bold overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white group-hover:scale-105 transition duration-300" />
                            <span className="relative z-10 text-black group-hover:tracking-wide transition-all">GET ACCESS</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 🎬 HERO SECTION (Cinematic) */}
            <header className="relative min-h-screen flex items-center justify-center container mx-auto px-6 z-10 pt-20">
                <motion.div
                    style={{ y: yHero, opacity: opacityHero }}
                    className="text-center w-full max-w-5xl mx-auto"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black/30 border border-cyan-500/30 mb-12 backdrop-blur-xl">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                            <span className="text-sm font-medium text-cyan-300 tracking-widest uppercase">System Online // 2026.01.01</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-7xl md:text-9xl font-black leading-tight mb-8 tracking-tighter mix-blend-overlay"
                    >
                        TRADE THE <br />
                        <span className="bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent opacity-80">
                            FUTURE
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        The world's first <span className="text-cyan-400 font-semibold">AI Oracle</span> for VN30.
                        <br />Institutional-grade signals. Zero latency.
                    </motion.p>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Link href="/beta" className="group relative w-64 h-16 bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-cyan-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition duration-500" />
                            <span className="text-lg font-bold tracking-widest group-hover:scale-105 transition duration-300">START BETA</span>
                        </Link>

                        <Link href="#demo" className="text-gray-400 hover:text-white transition flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition">
                                ▶
                            </div>
                            <span className="font-medium tracking-wide">WATCH DEMO</span>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* 3D GLOBE OVERLAY (Floating in background) */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] -z-10 opacity-40 pointer-events-none">
                    <Suspense fallback={null}>
                        <SceneContainer className="w-full h-full">
                            <SentinelGlobe />
                        </SceneContainer>
                    </Suspense>
                </div>
            </header>

            {/* 🧬 HOLOGRAPHIC STATS STRIP (Liquid Glass) */}
            <section className="relative z-20 py-12 border-y border-white/5 bg-white/5 backdrop-blur-xl">
                <div className="container mx-auto px-6">
                    <div className="flex justify-around items-center flex-wrap gap-12">
                        {[
                            { label: 'Market Cap', value: '$240B', color: 'text-cyan-400' },
                            { label: 'AI Prediction', value: '94.2%', color: 'text-purple-400' },
                            { label: 'Latency', value: '12ms', color: 'text-green-400' },
                            { label: 'Traders', value: '12.5k', color: 'text-pink-400' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-white transition">{stat.label}</div>
                                <div className={`text-5xl font-black ${stat.color} font-mono tracking-tighter`}>{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 💠 FEATURE GRID (Refraction Cards) */}
            <section id="features" className="container mx-auto px-6 py-40">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-32"
                >
                    <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-400 to-gray-600 bg-clip-text text-transparent mb-6">
                        QUANTUM ADVANTAGE
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full" />
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: 'NEURAL CLOUD',
                            desc: 'Real-time linear regression models processing millions of data points.',
                            gradient: 'from-purple-500/10 to-blue-500/10'
                        },
                        {
                            title: 'ZERO LATENCY',
                            desc: 'Edge-computed signals delivered via WebSocket in under 50ms.',
                            gradient: 'from-cyan-500/10 to-emerald-500/10'
                        },
                        {
                            title: 'SENTINEL AI',
                            desc: '24/7 autonomous monitoring with automated risk management.',
                            gradient: 'from-pink-500/10 to-orange-500/10'
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className={`h-[400px] p-10 rounded-[2rem] border border-white/10 bg-gradient-to-br ${feature.gradient} backdrop-blur-2xl relative overflow-hidden group flex flex-col justify-end`}
                        >
                            {/* Glass Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

                            <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>

                            {/* Decorative Number */}
                            <div className="absolute top-6 right-8 text-9xl font-black text-white/5 pointer-events-none">
                                0{i + 1}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 py-12 bg-black/40 backdrop-blur-sm">
                <div className="container mx-auto px-6 flex justify-between items-center text-gray-600 text-sm">
                    <div>© 2026 VN30-QUANTUM</div>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition">LEGAL</Link>
                        <Link href="#" className="hover:text-white transition">PRIVACY</Link>
                        <Link href="#" className="hover:text-white transition">CONTACT</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
