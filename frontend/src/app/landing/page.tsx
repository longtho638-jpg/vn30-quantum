'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import 3D components to avoid SSR issues
const SceneContainer = dynamic(() => import('@/components/Three/SceneContainer'), { ssr: false });
const SentinelGlobe = dynamic(() => import('@/components/Three/SentinelGlobe'), { ssr: false });

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden font-sans selection:bg-purple-500/30">

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-[#0f172a]/70">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl animate-pulse">🔮</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            VN30-Quantum
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="#features" className="hover:text-white transition">Features</Link>
                        <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                        <Link href="/docs/getting-started" className="hover:text-white transition">Docs</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium hover:text-white transition text-gray-400">
                            Sign In
                        </Link>
                        <Link
                            href="/beta"
                            className="px-6 py-2.5 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        >
                            Get Access
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section with 3D Globe */}
            <header className="relative pt-32 pb-20 container mx-auto px-6 z-10 flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 text-left z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm font-medium text-green-400">System Online: All Systems Normal</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
                            Analyze the Market <br />
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent typing-effect">
                                Like Iron Man
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
                            The world&apos;s most beautiful trading platform.
                            AI-powered signals, real-time sentiment analysis, and 3D visualization for the VN30 index.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/beta" className="group relative px-8 py-4 bg-white text-black rounded-xl font-bold overflow-hidden">
                                <span className="relative z-10 group-hover:text-black transition">Join Beta Waitlist</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition duration-300 blur-xl" />
                            </Link>
                            <Link href="#demo" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition backdrop-blur-md flex items-center justify-center gap-2">
                                <span>▶</span> Watch Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* 3D Globe Container */}
                <div className="md:w-1/2 h-[500px] md:h-[700px] absolute right-[-100px] top-20 md:relative md:right-auto md:top-auto opacity-50 md:opacity-100 pointer-events-none md:pointer-events-auto">
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-purple-500">Loading Hologram...</div>}>
                        <SceneContainer className="w-full h-full">
                            <SentinelGlobe />
                        </SceneContainer>
                    </Suspense>
                </div>
            </header>

            {/* Stats Hologram Strip */}
            <section className="border-y border-white/5 bg-black/20 backdrop-blur-sm transform rotate-[-1deg] scale-105 origin-left z-20 relative">
                <div className="container mx-auto px-6 py-6 flex justify-between items-center overflow-x-auto gap-12 no-scrollbar">
                    {[
                        { label: 'VN30 Index', value: '1,245.67', change: '+1.2%', up: true },
                        { label: 'AI Accuracy', value: '87.4%', change: '+0.5%', up: true },
                        { label: 'Active Signals', value: '12', change: 'Strong Buy', up: true },
                        { label: 'Latency', value: '45ms', change: '-5ms', up: true },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col min-w-[150px]">
                            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">{stat.label}</span>
                            <div className="flex items-end gap-3">
                                <span className="text-2xl font-mono font-bold text-white">{stat.value}</span>
                                <span className={`text-sm font-bold ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Grid - Glass Cards */}
            <section id="features" className="container mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Quantum Technology</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Powered by advanced machine learning models and real-time data processing.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '🧠',
                            title: 'Neural Oracle',
                            desc: 'Linear regression models trained on 10 years of market data to predict price movements.',
                            color: 'from-purple-500/20 to-blue-500/20'
                        },
                        {
                            icon: '⚡',
                            title: 'Flash Signals',
                            desc: 'Instant Telegram alerts sent <500ms after a market opportunity is detected.',
                            color: 'from-blue-500/20 to-cyan-500/20'
                        },
                        {
                            icon: '🛡️',
                            title: 'Iron Dome',
                            desc: 'Bank-grade security with Cloudflare Zero Trust and military-grade encryption.',
                            color: 'from-emerald-500/20 to-green-500/20'
                        }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className={`p-8 rounded-3xl border border-white/10 bg-gradient-to-br ${feature.color} backdrop-blur-xl relative overflow-hidden group`}
                        >
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="text-5xl mb-6 bg-white/10 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 pb-32">
                <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-24 text-center border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-black/40 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                            Ready for the Future?
                        </h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                            Join the waitlist today and get 50% off the Pro plan for life.
                            Only 100 spots available for the beta.
                        </p>
                        <Link
                            href="/beta"
                            className="inline-block px-12 py-5 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            Reserve My Spot
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-12">
                <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                    <div className="flex justify-center gap-8 mb-8">
                        <Link href="#" className="hover:text-white transition">Twitter</Link>
                        <Link href="#" className="hover:text-white transition">GitHub</Link>
                        <Link href="#" className="hover:text-white transition">Telegram</Link>
                    </div>
                    <p>© 2026 VN30-Quantum. Built with 🔮 by Solo Founder.</p>
                </div>
            </footer>
        </div>
    );
}
