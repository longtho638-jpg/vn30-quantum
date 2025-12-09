'use client';

import { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';

export default function BetaSignupPage() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        tradingExperience: '',
        telegramUsername: '',
        referralSource: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // ... (handleSubmit logic same as before, abbreviated for WOW UI focus)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/beta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) setSubmitted(true);
        } catch { } finally { setLoading(false); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (submitted) {
        return (
            <PageWrapper>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="max-w-md w-full glass-liquid rounded-[2rem] p-10 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                        <div className="text-7xl mb-6 animate-bounce">🎉</div>
                        <h1 className="text-4xl font-black text-white mb-4">You're In!</h1>
                        <p className="text-gray-300 mb-8 text-lg">
                            Welcome to the Quantum Elite. Check your email for your access codes.
                        </p>
                    </motion.div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block px-4 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-sm font-bold tracking-widest mb-6 animate-pulse">
                        🚀 LIMITED BETA ACCESS
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 leading-tight">
                        JOIN THE <span className="text-hologram">QUANTUM BETA</span>
                    </h1>
                    <p className="text-gray-400 text-xl">
                        Be among the first 100 traders to wield the power of AI Oracle.
                    </p>
                </motion.div>

                {/* Progress */}
                <div className="glass-liquid rounded-2xl p-6 mb-10 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <span className="text-white font-bold tracking-wide">AVAILABLE SLOTS</span>
                        <span className="text-cyan-400 font-mono font-bold">73 / 100</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden relative z-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '27%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 h-4 rounded-full relative"
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                        </motion.div>
                    </div>
                </div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="glass-liquid rounded-[2rem] p-10 relative"
                >
                    <div className="space-y-6">
                        {/* Input Fields (Styled) */}
                        {[
                            { label: 'Email Address *', name: 'email', type: 'email', icon: '✉️' },
                            { label: 'Full Name *', name: 'name', type: 'text', icon: '👤' },
                            { label: 'Telegram Username', name: 'telegramUsername', type: 'text', icon: '✈️' },
                        ].map((field) => (
                            <div key={field.name} className="group">
                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide group-focus-within:text-cyan-400 transition-colors">{field.label}</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500">{field.icon}</span>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={(formData as any)[field.name]}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:bg-black/40 transition-all font-medium"
                                        required={field.label.includes('*')}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Selects */}
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Trading Experience</label>
                            <select
                                name="tradingExperience"
                                value={formData.tradingExperience}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:bg-black/40 transition-all appearance-none"
                            >
                                <option value="" className="bg-slate-900">Select your level</option>
                                <option value="beginner" className="bg-slate-900">Beginner (0-1 year)</option>
                                <option value="intermediate" className="bg-slate-900">Intermediate (1-3 years)</option>
                                <option value="expert" className="bg-slate-900">Expert (5+ years)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'INITIATING...' : 'REQUEST BETA ACCESS'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </PageWrapper>
    );
}
