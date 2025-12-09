'use client';

import { useState } from 'react';

export default function LandingPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Integrate with email service
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="container mx-auto px-6 py-4">
                <nav className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🔮</span>
                        <span className="text-xl font-bold text-white">VN30-Quantum</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                        <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                        <a href="#api" className="text-gray-300 hover:text-white transition">API</a>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">
                            Login
                        </button>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-block px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
                        🚀 AI-Powered Trading Signals for VN30
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Trade Smarter with <br />
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI-Powered Signals
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Real-time analysis of 30 VN30 stocks using RSI, MACD, Bollinger Bands,
                        and AI price prediction. Get instant Telegram alerts for trading opportunities.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-purple-500/30">
                            Start Free Trial
                        </button>
                        <button className="border border-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 transition">
                            View Demo
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">30</div>
                            <div className="text-gray-400">VN30 Stocks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">&lt;2s</div>
                            <div className="text-gray-400">Signal Latency</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white">24/7</div>
                            <div className="text-gray-400">Monitoring</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-white text-center mb-16">
                    Powerful Features for Serious Traders
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🧠</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">AI Price Prediction</h3>
                        <p className="text-gray-400">
                            Linear Regression model trained on 30 candles predicts next closing price with high accuracy.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Technical Analysis</h3>
                        <p className="text-gray-400">
                            RSI, MACD, Bollinger Bands, Stochastic, SMA/EMA calculated in real-time for all 30 stocks.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">📱</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Telegram Alerts</h3>
                        <p className="text-gray-400">
                            Instant notifications when STRONG_BUY or STRONG_SELL signals are detected.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Zero Trust Security</h3>
                        <p className="text-gray-400">
                            Enterprise-grade security with Cloudflare Tunnel and Email OTP authentication.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">Real-time Dashboard</h3>
                        <p className="text-gray-400">
                            Grafana-powered dashboard with live charts, signal annotations, and performance metrics.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🔌</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-4">API Access</h3>
                        <p className="text-gray-400">
                            REST API for integrating signals into your own trading systems and bots.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="container mx-auto px-6 py-20">
                <h2 className="text-3xl font-bold text-white text-center mb-4">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                    Start free, upgrade when you need more. No hidden fees.
                </p>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Starter */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
                        <p className="text-gray-400 mb-6">Perfect for beginners</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$29</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> 5 stocks monitoring
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Daily signals
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Email alerts
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Basic dashboard
                            </li>
                        </ul>
                        <button className="w-full py-3 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition">
                            Get Started
                        </button>
                    </div>

                    {/* Pro - Featured */}
                    <div className="bg-gradient-to-b from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/50 relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-1 rounded-full">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                        <p className="text-gray-400 mb-6">For active traders</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$99</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> All 30 VN30 stocks
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Real-time signals
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Telegram alerts
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> AI price prediction
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Advanced dashboard
                            </li>
                        </ul>
                        <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition">
                            Upgrade to Pro
                        </button>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                        <p className="text-gray-400 mb-6">For institutions</p>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-white">$499</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Everything in Pro
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> API access
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Custom alerts
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> Priority support
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <span className="text-green-400">✓</span> White-label option
                            </li>
                        </ul>
                        <button className="w-full py-3 border border-purple-500 text-purple-400 rounded-xl hover:bg-purple-500/10 transition">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Waitlist Section */}
            <section className="container mx-auto px-6 py-20">
                <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl p-12 text-center border border-purple-500/30">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Join the Waitlist
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Be the first to access VN30-Quantum when we launch. Early adopters get 50% off for life.
                    </p>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                            >
                                Join Waitlist
                            </button>
                        </form>
                    ) : (
                        <div className="text-green-400 text-lg">
                            ✅ You're on the list! We'll notify you when we launch.
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 border-t border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔮</span>
                        <span className="text-lg font-bold text-white">VN30-Quantum</span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-400">
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Contact</a>
                    </div>
                    <div className="text-gray-500">
                        © 2026 VN30-Quantum. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
